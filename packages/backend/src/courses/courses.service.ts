import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findOne(id: number): Promise<Course> {
    return await this.courseRepository.findOne({ where: { id } });
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    await this.courseRepository.update(id, updateCourseDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  async batchUpsert(
    courses: CreateCourseDto[],
  ): Promise<{ created: number; updated: number; courses: Course[] }> {
    const results: Course[] = [];
    let created = 0;
    let updated = 0;

    for (const courseDto of courses) {
      // Find existing course by name
      const existingCourse = await this.courseRepository.findOne({
        where: { name: courseDto.name },
      });

      if (existingCourse) {
        // Update existing course
        await this.courseRepository.update(existingCourse.id, courseDto);
        const updatedCourse = await this.findOne(existingCourse.id);
        results.push(updatedCourse);
        updated++;
      } else {
        // Create new course
        const newCourse = this.courseRepository.create(courseDto);
        const savedCourse = await this.courseRepository.save(newCourse);
        results.push(savedCourse);
        created++;
      }
    }

    return { created, updated, courses: results };
  }
}
