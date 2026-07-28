import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Student } from './student.entity';
import { StudentWithBalanceDto } from './dto/student-with-balance.dto';
import { BaseCrudService } from '../common/base-crud.service';

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
        `(SELECT g.unitCost FROM "group" g, json_each(g.studentIds) je` +
          ` WHERE je.value = student.id AND g.isActive = 1 LIMIT 1)`,
        'groupUnitCost',
      )
      .from(Student, 'student');
    if (active !== undefined) {
      qb.where('student.active = :active', { active });
    }
    const rows = await qb.getRawMany<
      StudentWithBalanceDto & { groupUnitCost: number | null }
    >();
    return rows.map(({ groupUnitCost, ...row }) => {
      const baseRate = groupUnitCost ?? null;
      const unitCost =
        baseRate != null && row.discount
          ? baseRate * (1 - Number(row.discount) / 100)
          : baseRate;
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
