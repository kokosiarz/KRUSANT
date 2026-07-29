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
      return { ...row, unitCost, lessonsLeft };
    });
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
