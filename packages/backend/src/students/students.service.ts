import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Student } from './student.entity';
import { StudentWithBalanceDto } from './dto/student-with-balance.dto';
import { BaseCrudService } from '../common/base-crud.service';

// Group.unitCost is an hourly rate (see GroupsService.applyCourseDefaults:
// `unitCost = course.cost / course.numberOfHours`), not a per-lesson price —
// mirrors the frontend's calculateCost() used when a Class is created from a
// Group. A single lesson costs unitCost * (lesson length in hours).
function hhmmToMinutes(time: string | null | undefined): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Walks the student's upcoming classes in date order, charging each against the
 * current balance, and reports the first one they can't cover — "this is when
 * the money runs out".
 *
 * Charges `class.cost` with the student's discount, which is exactly what
 * ClassesService.setAttendance debits when a student is marked present, so the
 * forecast and the eventual real debits agree. Free classes (cost 0) are
 * skipped rather than counted as covered — they consume nothing, so letting
 * them inflate the count would overstate how far the balance stretches.
 */
function forecastFundsRunOut(
  balance: number,
  discountPercent: number,
  upcoming: { startTime: string; cost: number }[],
): {
  fundsRunOutDate: string | null;
  daysUntilFundsRunOut: number | null;
  scheduledLessonsCovered: number;
  scheduledLessonsAhead: number;
} {
  const payable = upcoming.filter((c) => Number(c.cost) > 0);
  let remaining = Number(balance);
  let covered = 0;

  for (const cls of payable) {
    const charge = Number(cls.cost) * (1 - discountPercent / 100);
    if (remaining < charge) {
      return {
        fundsRunOutDate: cls.startTime,
        // Sent from here rather than derived in the browser: the server
        // already fixed "now" when it picked the upcoming classes, so deriving
        // it client-side would measure against a different clock (and calling
        // Date.now() during render is impure anyway).
        daysUntilFundsRunOut: Math.ceil(
          (new Date(cls.startTime).getTime() - Date.now()) / 86_400_000,
        ),
        scheduledLessonsCovered: covered,
        scheduledLessonsAhead: payable.length,
      };
    }
    remaining -= charge;
    covered += 1;
  }

  // Balance stretches past everything currently on the calendar.
  return {
    fundsRunOutDate: null,
    daysUntilFundsRunOut: null,
    scheduledLessonsCovered: covered,
    scheduledLessonsAhead: payable.length,
  };
}

@Injectable()
export class StudentsService extends BaseCrudService<Student> {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private dataSource: DataSource,
  ) {
    super(studentRepository, { entityName: 'Student', uniqueBy: 'email' });
  }

  async findAllWithBalance(active?: boolean): Promise<StudentWithBalanceDto[]> {
    // Use a single query to aggregate debits and payments per student
    const qb = this.dataSource.createQueryBuilder();
    qb.select('student.id', 'id')
      .addSelect('student.name', 'name')
      .addSelect('student.email', 'email')
      .addSelect('student.phone', 'phone')
      .addSelect('student.discount', 'discount')
      .addSelect('student.semester', 'semester')
      .addSelect('student.extraNotes', 'extraNotes')
      .addSelect('student.active', 'active')
      .addSelect(
        `COALESCE((SELECT SUM(p.amount) FROM payment p WHERE p."studentId" = student.id), 0)` +
          ` - COALESCE((SELECT SUM(d.amount) FROM debits d WHERE d."studentId" = student.id), 0)`,
        'balance',
      )
      .addSelect(
        `(SELECT g.unitCost FROM "group" g` +
          ` INNER JOIN group_students gs ON gs."groupId" = g.id` +
          ` WHERE gs."studentId" = student.id AND g.isActive = 1 LIMIT 1)`,
        'groupUnitCost',
      )
      .addSelect(
        `(SELECT g.lessonLength FROM "group" g` +
          ` INNER JOIN group_students gs ON gs."groupId" = g.id` +
          ` WHERE gs."studentId" = student.id AND g.isActive = 1 LIMIT 1)`,
        'groupLessonLength',
      )
      .from(Student, 'student');
    if (active !== undefined) {
      qb.where('student.active = :active', { active });
    }
    const rows = await qb.getRawMany<
      StudentWithBalanceDto & {
        groupUnitCost: number | null;
        groupLessonLength: string | null;
      }
    >();
    const upcomingByStudent = await this.findUpcomingClassesByStudent();

    return rows.map(({ groupUnitCost, groupLessonLength, ...row }) => {
      const hourlyRate = groupUnitCost ?? null;
      const lessonMinutes = hhmmToMinutes(groupLessonLength);
      // Both null when we can't determine an actual per-lesson cost — a
      // stale/naive fallback to the hourly rate would silently assume a
      // 1-hour lesson, which is wrong for this school's typical multi-hour
      // sessions.
      const costPerLesson =
        hourlyRate != null && lessonMinutes > 0
          ? Math.round((lessonMinutes * hourlyRate) / 60)
          : null;
      const unitCost =
        costPerLesson != null && row.discount
          ? costPerLesson * (1 - Number(row.discount) / 100)
          : costPerLesson;
      const lessonsLeft =
        unitCost && unitCost > 0 ? Math.floor(row.balance / unitCost) : null;

      const forecast = forecastFundsRunOut(
        row.balance,
        Number(row.discount) || 0,
        upcomingByStudent.get(row.id) ?? [],
      );

      return { ...row, unitCost, lessonsLeft, ...forecast };
    });
  }

  /**
   * Upcoming classes per student, oldest first, for the funds forecast.
   *
   * Joins classes to groups on `class.groupId`, **not** the `group_classes`
   * table. Both exist, but `group_classes` is empty in practice while
   * `class.groupId` is what ClassesService actually reads and writes — using
   * the join table here would silently forecast nothing for everyone.
   */
  private async findUpcomingClassesByStudent(): Promise<
    Map<number, { startTime: string; cost: number }[]>
  > {
    const rows = await this.dataSource.query<
      { studentId: number; startTime: string; cost: number }[]
    >(
      `SELECT gs."studentId" AS studentId, c."startTime" AS startTime, c.cost AS cost
         FROM class c
         INNER JOIN "group" g ON g.id = c."groupId"
         INNER JOIN group_students gs ON gs."groupId" = g.id
        WHERE c."startTime" > ?
          AND g."isActive" = 1
          AND g."isTemplate" = 0
        ORDER BY c."startTime" ASC`,
      [new Date().toISOString()],
    );

    const byStudent = new Map<number, { startTime: string; cost: number }[]>();
    for (const { studentId, startTime, cost } of rows) {
      const list = byStudent.get(studentId) ?? [];
      list.push({ startTime, cost: Number(cost) });
      byStudent.set(studentId, list);
    }
    return byStudent;
  }

  async findAll(active?: boolean): Promise<Student[]> {
    if (active !== undefined) {
      return await this.studentRepository.find({ where: { active } });
    }
    return await this.studentRepository.find();
  }

  async findByEmail(email: string): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { email } });
    if (!student) throw new NotFoundException(`No student with email ${email}`);
    return student;
  }
}
