import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ActionLogService, Actor } from '../action-log/action-log.service';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { ClassAttendance, AttendanceStatus } from './class-attendance.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { AttendanceEntryDto } from './dto/attendance-entry.dto';
import { Student } from '../students/student.entity';
import { Debit } from '../debits/debit.entity';
import { GroupsService } from '../groups/groups.service';

export type ClassWithRoster = Omit<ClassEntity, 'plannedStudents'> & {
  plannedStudentsIds: number[];
  attendedStudentsIds: number[];
  absentStudentsIds: number[];
  rescheduledStudentsIds: number[];
};

const ATTENDANCE_STATUSES = Object.values(AttendanceStatus);

// Doesn't extend BaseCrudService: like Group, the response shape
// (plannedStudentsIds/attendedStudentsIds/... derived from relations and the
// class_attendance table) differs from the entity shape on every method,
// leaving nothing useful to share.
@Injectable()
export class ClassesService implements OnModuleInit {
  constructor(
    @InjectRepository(ClassEntity)
    private classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassAttendance)
    private classAttendanceRepository: Repository<ClassAttendance>,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly actionLog: ActionLogService,
  ) {}

  /** Teaches the action log how to reverse a class write. */
  onModuleInit(): void {
    this.actionLog.registerHandler('class', {
      load: async (id) => {
        try {
          return await this.findOne(id);
        } catch {
          return null;
        }
      },
      // Keeps the original id so debits pointing at this class line up again.
      restore: async (snapshot) => {
        await this.dataSource.transaction(async (manager) => {
          const repo = manager.getRepository(ClassEntity);
          const {
            attendedStudentsIds,
            absentStudentsIds,
            rescheduledStudentsIds,
            plannedStudentsIds,
            ...rest
          } = snapshot;
          await repo.save(repo.create(rest as Partial<ClassEntity>));
          await this.syncPlannedRoster(
            manager,
            Number(snapshot.id),
            plannedStudentsIds,
          );
          await this.syncAttendance(
            manager,
            Number(snapshot.id),
            attendedStudentsIds,
            absentStudentsIds,
            rescheduledStudentsIds,
          );
        });
      },
      revert: async (id, snapshot) => {
        const {
          id: _id,
          createdAt,
          updatedAt,
          attendedStudentsIds,
          absentStudentsIds,
          rescheduledStudentsIds,
          plannedStudentsIds,
          ...rest
        } = snapshot;
        await this.update(id, {
          ...rest,
          attendedStudentsIds,
          absentStudentsIds,
          rescheduledStudentsIds,
          plannedStudentsIds,
        });
      },
      remove: async (id) => {
        await this.classRepository.delete(id);
      },
    });
  }

  private toResponse(
    entity: ClassEntity,
    attendance: ClassAttendance[],
  ): ClassWithRoster {
    const { plannedStudents, ...rest } = entity;
    const byStatus = (status: AttendanceStatus) =>
      attendance.filter((a) => a.status === status).map((a) => a.studentId);
    return {
      ...rest,
      plannedStudentsIds: (plannedStudents ?? []).map((s) => s.id),
      attendedStudentsIds: byStatus(AttendanceStatus.Present),
      absentStudentsIds: byStatus(AttendanceStatus.Absent),
      rescheduledStudentsIds: byStatus(AttendanceStatus.Rescheduled),
    };
  }

  private async loadOne(
    manager: EntityManager,
    id: number,
  ): Promise<ClassWithRoster> {
    const entity = await manager.getRepository(ClassEntity).findOne({
      where: { id },
      relations: { plannedStudents: true },
    });
    if (!entity) throw new NotFoundException(`Class ${id} not found`);
    const attendance = await manager
      .getRepository(ClassAttendance)
      .find({ where: { classId: id } });
    return this.toResponse(entity, attendance);
  }

  /** Only touches the planned roster when the caller actually supplied it (PATCH semantics). */
  private async syncPlannedRoster(
    manager: EntityManager,
    classId: number,
    plannedStudentsIds: number[] | undefined,
  ): Promise<void> {
    if (plannedStudentsIds === undefined) return;
    const builder = manager
      .createQueryBuilder()
      .relation(ClassEntity, 'plannedStudents')
      .of(classId);
    const current = await builder.loadMany<{ id: number }>();
    const currentIds = current.map((r) => r.id);
    const toAdd = plannedStudentsIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter(
      (id) => !plannedStudentsIds.includes(id),
    );
    if (toAdd.length || toRemove.length) {
      await builder.addAndRemove(toAdd, toRemove);
    }
  }

  /**
   * Only touches attendance when the caller supplied at least one of the
   * three status arrays (PATCH semantics, like syncPlannedRoster) — once any
   * one is present the other two are treated as empty, since together they
   * describe the complete tri-state picture for the class.
   */
  private async syncAttendance(
    manager: EntityManager,
    classId: number,
    attendedStudentsIds: number[] | undefined,
    absentStudentsIds: number[] | undefined,
    rescheduledStudentsIds: number[] | undefined,
  ): Promise<void> {
    if (
      attendedStudentsIds === undefined &&
      absentStudentsIds === undefined &&
      rescheduledStudentsIds === undefined
    ) {
      return;
    }

    const target = new Map<number, AttendanceStatus>();
    for (const id of rescheduledStudentsIds ?? [])
      target.set(id, AttendanceStatus.Rescheduled);
    for (const id of absentStudentsIds ?? [])
      target.set(id, AttendanceStatus.Absent);
    // Present last: if a caller (accidentally) lists the same id in more than
    // one array, presence wins.
    for (const id of attendedStudentsIds ?? [])
      target.set(id, AttendanceStatus.Present);

    const attendanceRepo = manager.getRepository(ClassAttendance);
    const current = await attendanceRepo.find({ where: { classId } });
    const currentByStudent = new Map(current.map((a) => [a.studentId, a]));

    const toRemove = current.filter((a) => !target.has(a.studentId));
    if (toRemove.length) await attendanceRepo.remove(toRemove);

    const toSave: ClassAttendance[] = [];
    for (const [studentId, status] of target) {
      const existing = currentByStudent.get(studentId);
      if (!existing || existing.status !== status) {
        toSave.push(attendanceRepo.create({ classId, studentId, status }));
      }
    }
    if (toSave.length) await attendanceRepo.save(toSave);
  }

  async findAll(groupId?: number): Promise<ClassWithRoster[]> {
    const classes = await this.classRepository.find({
      where: groupId !== undefined ? { groupId } : {},
      relations: { plannedStudents: true },
    });
    if (classes.length === 0) return [];

    const attendance = await this.classAttendanceRepository.find({
      where: { classId: In(classes.map((c) => c.id)) },
    });
    const attendanceByClass = new Map<number, ClassAttendance[]>();
    for (const a of attendance) {
      const list = attendanceByClass.get(a.classId) ?? [];
      list.push(a);
      attendanceByClass.set(a.classId, list);
    }

    return classes.map((c) =>
      this.toResponse(c, attendanceByClass.get(c.id) ?? []),
    );
  }

  async findOne(id: number): Promise<ClassWithRoster> {
    return this.loadOne(this.dataSource.manager, id);
  }

  async create(
    createDto: CreateClassDto,
    actor?: Actor,
  ): Promise<ClassWithRoster> {
    const {
      attendedStudentsIds,
      absentStudentsIds,
      rescheduledStudentsIds,
      plannedStudentsIds,
      ...rest
    } = createDto;
    const created = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ClassEntity);
      const saved = await repo.save(repo.create(rest as Partial<ClassEntity>));
      await this.syncPlannedRoster(manager, saved.id, plannedStudentsIds);
      await this.syncAttendance(
        manager,
        saved.id,
        attendedStudentsIds,
        absentStudentsIds,
        rescheduledStudentsIds,
      );
      return this.loadOne(manager, saved.id);
    });
    await this.actionLog.record({
      actor,
      entity: 'class',
      entityId: created.id,
      operation: 'create',
      label: `Utworzono ${describeClass(created)}`,
      after: created,
    });
    return created;
  }

  async update(
    id: number,
    updateDto: Partial<CreateClassDto>,
    actor?: Actor,
  ): Promise<ClassWithRoster> {
    // Snapshot first — after the write the previous state is gone.
    const before = await this.findOne(id);
    const {
      attendedStudentsIds,
      absentStudentsIds,
      rescheduledStudentsIds,
      plannedStudentsIds,
      ...rest
    } = updateDto;
    const updated = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ClassEntity);
      if (Object.keys(rest).length > 0) {
        await repo.update(id, rest);
      }
      await this.syncPlannedRoster(manager, id, plannedStudentsIds);
      await this.syncAttendance(
        manager,
        id,
        attendedStudentsIds,
        absentStudentsIds,
        rescheduledStudentsIds,
      );
      return this.loadOne(manager, id);
    });
    await this.actionLog.record({
      actor,
      entity: 'class',
      entityId: id,
      operation: 'update',
      label: `Zmieniono ${describeClass(updated)}`,
      before,
      after: updated,
    });
    return updated;
  }

  async remove(id: number, actor?: Actor): Promise<void> {
    const before = await this.findOne(id);
    await this.classRepository.delete(id);
    await this.actionLog.record({
      actor,
      entity: 'class',
      entityId: id,
      operation: 'delete',
      label: `Usunięto ${describeClass(before)}`,
      before,
    });
  }

  async setAttendance(
    id: number,
    entries: AttendanceEntryDto[],
  ): Promise<{ class: ClassWithRoster; createdDebits: Debit[] }> {
    // Reject a malformed body rather than coercing it to []. Treating "I
    // couldn't understand you" as "nobody attended" silently clears the roster
    // AND deletes every debit for the class — real money records — so this has
    // to fail loudly.
    if (!Array.isArray(entries)) {
      throw new BadRequestException(
        'attendance must be an array of {studentId, status} entries',
      );
    }
    const clean: { studentId: number; status: AttendanceStatus }[] = [];
    const seen = new Set<number>();
    for (const entry of entries) {
      const studentId = Number((entry as { studentId?: unknown })?.studentId);
      const status = (entry as { status?: unknown })?.status;
      if (isNaN(studentId) || seen.has(studentId)) continue;
      if (!ATTENDANCE_STATUSES.includes(status as AttendanceStatus)) continue;
      seen.add(studentId);
      clean.push({ studentId, status: status as AttendanceStatus });
    }

    return this.dataSource.transaction(async (manager) => {
      const classRepo = manager.getRepository(ClassEntity);
      const debitRepo = manager.getRepository(Debit);
      const studentRepo = manager.getRepository(Student);
      const attendanceRepo = manager.getRepository(ClassAttendance);

      const classEntity = await classRepo.findOne({ where: { id } });
      if (!classEntity) throw new NotFoundException('Class not found');

      // Full replace: an id missing from `clean` goes back to unmarked,
      // exactly like the old attendedStudentsIds semantics.
      const existingAttendance = await attendanceRepo.find({
        where: { classId: id },
      });
      const existingByStudent = new Map(
        existingAttendance.map((a) => [a.studentId, a]),
      );
      const rowsToRemove = existingAttendance.filter(
        (a) => !clean.some((e) => e.studentId === a.studentId),
      );
      if (rowsToRemove.length) await attendanceRepo.remove(rowsToRemove);
      const rowsToSave = clean
        .filter((e) => existingByStudent.get(e.studentId)?.status !== e.status)
        .map((e) =>
          attendanceRepo.create({
            classId: id,
            studentId: e.studentId,
            status: e.status,
          }),
        );
      if (rowsToSave.length) await attendanceRepo.save(rowsToSave);

      // Billable statuses: present and absent both consume a scheduled lesson
      // and bill the student; rescheduled is an excused postponement — no
      // debit, and it instead counts toward the student's outstanding
      // make-up balance (StudentsService.findAllWithBalance).
      const billableStudentIds = clean
        .filter((e) => e.status !== AttendanceStatus.Rescheduled)
        .map((e) => e.studentId);

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
      const existingDebitByStudentId = new Map(
        existingDebits.map((d) => [d.studentId, d]),
      );

      // A student no longer billable (un-marked, or moved to rescheduled)
      // has the debit that marking created removed, not left behind forever.
      const debitsToRemove = existingDebits.filter(
        (d) => !billableStudentIds.includes(d.studentId),
      );
      if (debitsToRemove.length > 0) {
        await debitRepo.remove(debitsToRemove);
      }

      const studentIdsNeedingDebits = billableStudentIds.filter(
        (sid) => !existingDebitByStudentId.has(sid),
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

      return { class: await this.loadOne(manager, id), createdDebits };
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

/**
 * Short human description used in the history list — "zajęcia 04.08.2026, 09:00"
 * rather than an opaque id, so the log is readable without cross-referencing.
 */
function describeClass(cls: { startTime?: string }): string {
  if (!cls?.startTime) return 'zajęcia';
  const when = new Date(cls.startTime);
  if (Number.isNaN(when.getTime())) return 'zajęcia';
  return `zajęcia ${new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw',
  }).format(when)}`;
}
