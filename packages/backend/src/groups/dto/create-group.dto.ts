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

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Group A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Group active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Array of student IDs',
    example: [1, 2, 3],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds?: number[];

  @ApiPropertyOptional({
    description: 'Array of class IDs',
    example: [1, 2, 3],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  classIds?: number[];

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

  @ApiProperty({ description: 'Teacher ID', example: 1 })
  @IsNumber()
  teacherId: number;

  @ApiProperty({ description: 'Total course cost', example: 3325.0 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ description: 'Cost per unit', example: 50.0 })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiPropertyOptional({
    description: 'Additional comments',
    example: '',
    default: '',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Group color hex for visual identification',
    example: '#4CAF50',
  })
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional({
    description: 'Start hour as time (HH:mm or HH:mm:ss)',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  startHour?: string;

  @ApiPropertyOptional({
    description: 'Lesson length as time (HH:mm or HH:mm:ss)',
    example: '01:00',
  })
  @IsOptional()
  @IsString()
  lessonLength?: string;

  @ApiPropertyOptional({
    description: 'Room ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  roomId?: number;
  
  @ApiPropertyOptional({ description: 'Number of hours for the group', example: 40 })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfHours?: number;
}
