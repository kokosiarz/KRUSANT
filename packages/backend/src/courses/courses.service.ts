import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class CoursesService extends BaseCrudService<Course> {
  constructor(
    @InjectRepository(Course)
    courseRepository: Repository<Course>,
  ) {
    super(courseRepository, { entityName: 'Course', uniqueBy: 'name' });
  }
}
