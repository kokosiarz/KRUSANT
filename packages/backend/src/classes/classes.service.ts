import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Student } from '../students/student.entity';
import { Debit } from '../debits/debit.entity';
import { GroupsService } from '../groups/groups.service';

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

  async findAll(groupId?: number): Promise<ClassEntity[]> {
    if (groupId !== undefined) {
      return await this.classRepository.find({ where: { groupId } });
    }
    return await this.classRepository.find();
  }

  async findOne(id: number): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({ where: { id } });
    if (!classEntity) throw new NotFoundException(`Class ${id} not found`);
    return classEntity;
  }

  async create(createDto: CreateClassDto): Promise<ClassEntity> {
    const {
      attendedStudentsIds,
      plannedStudentsIds,
      teacherId,
      cost,
      comment,
      ...rest
    } = createDto;
    const entity = this.classRepository.create({ ...rest, cost, comment });
    if (attendedStudentsIds) {
      (entity as any).attendedStudentsIds = attendedStudentsIds;
    }
    if (plannedStudentsIds) {
      (entity as any).plannedStudentsIds = plannedStudentsIds;
    }
    if (teacherId !== undefined) {
      (entity as any).teacherId = teacherId;
    }
    if (cost !== undefined) {
      (entity as any).cost = cost;
    }
    if (comment !== undefined) {
      (entity as any).comment = comment;
    }
    return await this.classRepository.save(entity);
  }

  async update(id: number, updateDto: UpdateClassDto): Promise<ClassEntity> {
    await this.classRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async setAttendance(
    id: number,
    attendedStudentsIds: number[],
  ): Promise<{ class: ClassEntity; createdDebits: Debit[] }> {
    const cleanAttendedIds = Array.isArray(attendedStudentsIds)
      ? attendedStudentsIds
          .map(Number)
          .filter((v) => typeof v === 'number' && !isNaN(v))
      : [];

    return this.dataSource.transaction(async (manager) => {
      const classRepo = manager.getRepository(ClassEntity);
      const debitRepo = manager.getRepository(Debit);
      const studentRepo = manager.getRepository(Student);

      const classEntity = await classRepo.findOne({ where: { id } });
      if (!classEntity) throw new NotFoundException('Class not found');

      classEntity.attendedStudentsIds = cleanAttendedIds;
      await classRepo.save(classEntity);

      // Prepare group name for entitlement. groupId has no FK constraint, so
      // tolerate a group that's since been deleted rather than failing the
      // whole attendance save over a display string.
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

      return { class: classEntity, createdDebits };
    });
  }

  async remove(id: number): Promise<void> {
    await this.classRepository.delete(id);
  }

  async batchUpsert(
    classes: CreateClassDto[],
  ): Promise<{ created: number; updated: number; classes: ClassEntity[] }> {
    const results: ClassEntity[] = [];
    let created = 0;
    let updated = 0;

    for (const classDto of classes) {
      // Find existing class by startTime and roomId
      const existingClass = await this.classRepository.findOne({
        where: { startTime: classDto.startTime, roomId: classDto.roomId },
      });

      if (existingClass) {
        // Update existing class
        await this.classRepository.update(existingClass.id, classDto);
        const updatedClass = await this.findOne(existingClass.id);
        results.push(updatedClass);
        updated++;
      } else {
        // Create new class
        const newClass = this.classRepository.create(classDto);
        const savedClass = await this.classRepository.save(newClass);
        results.push(savedClass);
        created++;
      }
    }
    return { created, updated, classes: results };
  }

  async batchCreate(classes: CreateClassDto[]): Promise<ClassEntity[]> {
    const created: ClassEntity[] = [];
    for (const classDto of classes) {
      const newClass = this.classRepository.create(classDto);
      const savedClass = await this.classRepository.save(newClass);
      created.push(savedClass);
    }
    return created;
  }
}
