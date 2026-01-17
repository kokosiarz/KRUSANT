
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ description: 'Class start time (ISO datetime)', example: '2026-01-06T10:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Lesson length as time (HH:mm or HH:mm:ss)',
    example: '01:00',
  })
  @IsString()
  lessonLength: string;

  @ApiPropertyOptional({ description: 'Room ID', example: 201 })
  @IsOptional()
  @IsNumber()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Group ID', example: 10 })
  @IsOptional()
  @IsNumber()
  groupId?: number;

  @ApiPropertyOptional({ type: [Number], description: 'IDs of planned students' })
  @IsOptional()
  @IsArray()
  plannedStudentsIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'IDs of attended students' })
  @IsOptional()
  @IsArray()
  attendedStudentsIds?: number[];

  @ApiPropertyOptional({ type: Number, description: 'Teacher ID' })
  @IsOptional()
  teacherId?: number;

  @ApiProperty({ description: 'Class cost', example: 120 })
  @IsNumber()
  cost: number;

  @ApiPropertyOptional({ description: 'Optional comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}
