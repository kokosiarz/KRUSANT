import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';

@Injectable()
export class TeachersService {
  constructor(@InjectRepository(Teacher) private repo: Repository<Teacher>) {}
  create(body: Teacher) {
    const teacher = this.repo.create(body);
    return this.repo.save(teacher);
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
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
}
