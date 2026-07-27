import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

import { DataSource } from 'typeorm';
import { StudentWithBalanceDto } from './dto/student-with-balance.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private dataSource: DataSource,
  ) {}
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

  async findOne(id: number): Promise<Student> {
    return await this.studentRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Student> {
    return await this.studentRepository.findOne({ where: { email } });
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    await this.studentRepository.update(id, updateStudentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.studentRepository.delete(id);
  }

  async batchUpsert(
    students: CreateStudentDto[],
  ): Promise<{ created: number; updated: number; students: Student[] }> {
    const results: Student[] = [];
    let created = 0;
    let updated = 0;

    for (const studentDto of students) {
      // Find existing student by email
      const existingStudent = await this.studentRepository.findOne({
        where: { email: studentDto.email },
      });

      if (existingStudent) {
        // Update existing student
        await this.studentRepository.update(existingStudent.id, studentDto);
        const updatedStudent = await this.findOne(existingStudent.id);
        results.push(updatedStudent);
        updated++;
      } else {
        // Create new student
        const newStudent = this.studentRepository.create(studentDto);
        const savedStudent = await this.studentRepository.save(newStudent);
        results.push(savedStudent);
        created++;
      }
    }

    return { created, updated, students: results };
  }
}
