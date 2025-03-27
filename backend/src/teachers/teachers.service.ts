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
}
