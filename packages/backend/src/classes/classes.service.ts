import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { Student } from '../students/student.entity';
import { Debit } from '../debits/debit.entity';
import { GroupsService } from '../groups/groups.service';

export type ClassWithRoster = Omit<
  ClassEntity,
  'attendedStudents' | 'plannedStudents'
> & {
  attendedStudentsIds: number[];
  plannedStudentsIds: number[];
};

// Doesn't extend BaseCrudService: like Group, the response shape
// (attendedStudentsIds/plannedStudentsIds derived from relations) differs from
// the entity shape on every method, leaving nothing useful to share.
@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private classRepository: Repository<ClassEntity>,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private toResponse(entity: ClassEntity): ClassWithRoster {
    const { attendedStudents, plannedStudents, ...rest } = entity;
    return {
      ...rest,
      attendedStudentsIds: (attendedStudents ?? []).map((s) => s.id),
      plannedStudentsIds: (plannedStudents ?? []).map((s) => s.id),
    };
  }

  private async loadOne(
    repo: Repository<ClassEntity>,
    id: number,
  ): Promise<ClassWithRoster> {
    const entity = await repo.findOne({
      where: { id },
      relations: { attendedStudents: true, plannedStudents: true },
    });
    if (!entity) throw new NotFoundException(`Class ${id} not found`);
    return this.toResponse(entity);
  }

  /** Only touches a roster when the caller actually supplied it (PATCH semantics). */
  private async syncRoster(
    manager: EntityManager,
    classId: number,
    attendedStudentsIds: number[] | undefined,
    plannedStudentsIds: number[] | undefined,
  ): Promise<void> {
    for (const [relation, ids] of [
      ['attendedStudents', attendedStudentsIds] as const,
      ['plannedStudents', plannedStudentsIds] as const,
    ]) {
      if (ids === undefined) continue;
      const builder = manager
        .createQueryBuilder()
        .relation(ClassEntity, relation)
        .of(classId);
      const current = await builder.loadMany<{ id: number }>();
      const currentIds = current.map((r) => r.id);
      const toAdd = ids.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !ids.includes(id));
      if (toAdd.length || toRemove.length) {
        await builder.addAndRemove(toAdd, toRemove);
      }
    }
  }

  async findAll(groupId?: number): Promise<ClassWithRoster[]> {
    const classes = await this.classRepository.find({
      where: groupId !== undefined ? { groupId } : {},
      relations: { attendedStudents: true, plannedStudents: true },
    });
    return classes.map((c) => this.toResponse(c));
  }

  async findOne(id: number): Promise<ClassWithRoster> {
    return this.loadOne(this.classRepository, id);
  }

  async create(createDto: CreateClassDto): Promise<ClassWithRoster> {
    const { attendedStudentsIds, plannedStudentsIds, ...rest } = createDto;
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ClassEntity);
      const saved = await repo.save(repo.create(rest as Partial<ClassEntity>));
      await this.syncRoster(
        manager,
        saved.id,
        attendedStudentsIds,
        plannedStudentsIds,
      );
      return this.loadOne(repo, saved.id);
    });
  }

  async update(
    id: number,
    updateDto: Partial<CreateClassDto>,
  ): Promise<ClassWithRoster> {
    const { attendedStudentsIds, plannedStudentsIds, ...rest } = updateDto;
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ClassEntity);
      if (Object.keys(rest).length > 0) {
        await repo.update(id, rest as Partial<ClassEntity>);
      }
      await this.syncRoster(manager, id, attendedStudentsIds, plannedStudentsIds);
      return this.loadOne(repo, id);
    });
  }

  async remove(id: number): Promise<void> {
    await this.classRepository.delete(id);
  }

  async setAttendance(
    id: number,
    attendedStudentsIds: number[],
  ): Promise<{ class: ClassWithRoster; createdDebits: Debit[] }> {
    // Reject a malformed body rather than coercing it to []. Treating "I
    // couldn't understand you" as "nobody attended" silently clears the roster
    // AND deletes every debit for the class — real money records — so this has
    // to fail loudly.
    if (!Array.isArray(attendedStudentsIds)) {
      throw new BadRequestException(
        'attendedStudentsIds must be an array of student ids',
      );
    }
    const cleanAttendedIds = attendedStudentsIds
      .map(Number)
      .filter((v) => !isNaN(v));

    return this.dataSource.transaction(async (manager) => {
      const classRepo = manager.getRepository(ClassEntity);
      const debitRepo = manager.getRepository(Debit);
      const studentRepo = manager.getRepository(Student);

      const classEntity = await classRepo.findOne({ where: { id } });
      if (!classEntity) throw new NotFoundException('Class not found');

      await this.syncRoster(manager, id, cleanAttendedIds, undefined);

      // Prepare group name for entitlement. groupId is SET NULL rather than
      // RESTRICT, so tolerate a group that's since been deleted rather than
      // failing the whole attendance save over a display string.
      let groupName = 'kurs';
      if (classEntity.groupId) {
        try {
          const group = await this.groupsService.findOne(classEntity.groupId);
          if (group?.name) groupName = group.name;
        } catch {
          // group no longer exists; keep the 'kurs' fallback
        }
      }

      // One query for every debit already tied to this class, instead of the
      // whole debits table re-fetched once per attending student.
      const existingDebits = await debitRepo.find({
        where: { classId: classEntity.id },
      });
      const existingByStudentId = new Map(
        existingDebits.map((d) => [d.studentId, d]),
      );

      // A student un-marked after previously being marked present should have
      // the debit that marking created removed, not left behind forever.
      const toRemove = existingDebits.filter(
        (d) => !cleanAttendedIds.includes(d.studentId),
      );
      if (toRemove.length > 0) {
        await debitRepo.remove(toRemove);
      }

      const studentIdsNeedingDebits = cleanAttendedIds.filter(
        (sid) => !existingByStudentId.has(sid),
      );
      const students = studentIdsNeedingDebits.length
        ? await studentRepo.find({ where: { id: In(studentIdsNeedingDebits) } })
        : [];
      const studentById = new Map(students.map((s) => [s.id, s]));

      const createdDebits: Debit[] = [];
      for (const studentId of studentIdsNeedingDebits) {
        const student = studentById.get(studentId);
        let amount = classEntity.cost;
        if (
          student &&
          typeof student.discount === 'number' &&
          !isNaN(student.discount)
        ) {
          amount =
            (Number(classEntity.cost) * (100 - Number(student.discount))) / 100;
        }
        const debit = debitRepo.create({
          studentId,
          classId: classEntity.id,
          amount,
          dueDate: classEntity.startTime
            ? new Date(classEntity.startTime)
            : new Date(),
          entitlement: `${groupName} @ ${new Date(classEntity.startTime).toLocaleString('pl-PL')}`,
        });
        createdDebits.push(await debitRepo.save(debit));
      }

      return { class: await this.loadOne(classRepo, id), createdDebits };
    });
  }

  async batchUpsert(
    classes: CreateClassDto[],
  ): Promise<{ created: number; updated: number; items: ClassWithRoster[] }> {
    const results: ClassWithRoster[] = [];
    let created = 0;
    let updated = 0;

    for (const classDto of classes) {
      // Classes match on a compound startTime+roomId key.
      const existing = await this.classRepository.findOne({
        where: { startTime: classDto.startTime, roomId: classDto.roomId },
      });
      if (existing) {
        results.push(await this.update(existing.id, classDto));
        updated++;
      } else {
        results.push(await this.create(classDto));
        created++;
      }
    }
    return { created, updated, items: results };
  }

  async batchCreate(classes: CreateClassDto[]): Promise<ClassWithRoster[]> {
    const created: ClassWithRoster[] = [];
    for (const classDto of classes) {
      created.push(await this.create(classDto));
    }
    return created;
  }
}
