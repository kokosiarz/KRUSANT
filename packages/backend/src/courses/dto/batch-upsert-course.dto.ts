import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';

export class BatchUpsertCourseDto {
  @ApiProperty({
    description: 'Array of courses to create or update',
    type: [CreateCourseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  courses: CreateCourseDto[];
}
