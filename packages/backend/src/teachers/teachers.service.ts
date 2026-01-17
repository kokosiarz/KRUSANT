import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(@InjectRepository(Teacher) private repo: Repository<Teacher>) {}
  create(body: CreateTeacherDto) {
    const teacher = this.repo.create(body);
    return this.repo.save(teacher);
  }

  async findOneById(id: number) {
    const teacher = await this.repo.findOneBy({ id });
    return teacher;
  }
  async findOneByEmail(email: string) {
    const teacher = await this.repo.findOneBy({ email });
    return teacher;
  }
  findAll() {
    return this.repo.find();
  }
  async update(id: number, body: Partial<Teacher>) {
    const teacher = await this.repo.findOneBy({ id });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return this.repo.save({
      ...teacher,
      ...body,
    });
  }
  remove(id: number) {
    return this.repo.delete(id);
  }
  async batchUpsert(
    teachers: CreateTeacherDto[],
  ): Promise<{ created: number; updated: number; teachers: Teacher[] }> {
    const results: Teacher[] = [];
    let created = 0;
    let updated = 0;

    for (const teacherDto of teachers) {
      // Find existing teacher by email
      const existingTeacher = await this.repo.findOne({
        where: { email: teacherDto.email },
      });

      if (existingTeacher) {
        // Update existing teacher
        const updatedTeacher = await this.update(
          existingTeacher.id,
          teacherDto,
        );
        results.push(updatedTeacher);
        updated++;
      } else {
        // Create new teacher
        const newTeacher = await this.create(teacherDto);
        results.push(newTeacher);
        created++;
      }
    }

    return { created, updated, teachers: results };
  }
}
