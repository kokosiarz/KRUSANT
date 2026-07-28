import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class TeachersService extends BaseCrudService<Teacher> {
  constructor(@InjectRepository(Teacher) repo: Repository<Teacher>) {
    super(repo, { entityName: 'Teacher', uniqueBy: 'email' });
  }

  // Null-tolerant lookups: callers (e.g. AuthService resolving a display
  // name) treat "no such teacher" as a normal case, not a 404 to throw.
  async findOneById(id: number): Promise<Teacher | null> {
    return this.repository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<Teacher | null> {
    return this.repository.findOneBy({ email });
  }
}
