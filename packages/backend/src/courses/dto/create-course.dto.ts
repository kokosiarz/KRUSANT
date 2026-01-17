import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsIn } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course name', example: 'Course A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Intensive course description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Course total cost', example: 3325.0 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ description: 'Total number of hours', example: 70.0 })
  @IsNumber()
  @Min(0)
  numberOfHours: number;

  @ApiProperty({ description: 'Length of each lesson as time (HH:mm or HH:mm:ss)', example: '02:30' })
  @IsString()
  lessonLength: string;

  @ApiProperty({
    description: 'Pattern of classes',
    example: 'workdays',
    enum: ['workdays', 'weekends', 'everyday', 'weekly', 'biweekly', 'monthly'],
  })
  @IsIn(['workdays', 'weekends', 'everyday', 'weekly', 'biweekly', 'monthly'])
  pattern:
    | 'workdays'
    | 'weekends'
    | 'everyday'
    | 'weekly'
    | 'biweekly'
    | 'monthly';
}
