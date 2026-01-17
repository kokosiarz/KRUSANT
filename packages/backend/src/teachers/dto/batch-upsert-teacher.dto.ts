import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateTeacherDto } from './create-teacher.dto';

export class BatchUpsertTeacherDto {
  @ApiProperty({
    description: 'Array of teachers to create or update',
    type: [CreateTeacherDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeacherDto)
  teachers: CreateTeacherDto[];
}
