import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class DateBoundaryDto {
  @ApiProperty({
    description: 'Day of month',
    example: 1,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiPropertyOptional({ description: 'Year (optional)', example: 2026 })
  @IsOptional()
  @IsInt()
  year?: number;
}

export class CreateGroupTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Evening Regular' })
  @IsString()
  templateName: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Student IDs',
    example: [1, 2],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds?: number[];

  @ApiPropertyOptional({
    description: 'Class IDs',
    example: [1, 2],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  classIds?: number[];

  @ApiPropertyOptional({ description: 'Teacher ID', example: 1 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @ApiPropertyOptional({ description: 'Total course cost', example: 3325.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Additional comments', example: '' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Minimum start date constraint',
    type: DateBoundaryDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateBoundaryDto)
  minStartDate?: DateBoundaryDto;

  @ApiPropertyOptional({
    description: 'Maximum end date constraint',
    type: DateBoundaryDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateBoundaryDto)
  maxEndDate?: DateBoundaryDto;

  @ApiPropertyOptional({
    description: 'Template color hex for visual identification',
    example: '#4CAF50',
  })
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional({
    description: 'Default start time (HH:mm or HH:mm:ss)',
    example: '09:00',
    type: String,
    format: 'time',
  })
  @IsOptional()
  @IsString()
  startHour?: string;

  @ApiPropertyOptional({
    description: 'Lesson duration as time (HH:mm or HH:mm:ss)',
    example: '01:00',
    type: String,
    format: 'time',
  })
  @IsOptional()
  @IsString()
  lessonLength?: string;

  @ApiPropertyOptional({ description: 'Room ID', example: 1 })
  @IsOptional()
  @IsNumber()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Course ID', example: 1 })
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Number of hours for the group template', example: 40 })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfHours?: number;
}
