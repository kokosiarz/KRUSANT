import { DebitDto } from './debit.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  ValidateNested,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentDto {
  @ApiProperty({ description: 'Payment date', example: '2026-01-05' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Payment amount', example: 100.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Payment comment', example: 'Monthly payment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ClassDto {
  @ApiProperty({ description: 'Class date', example: '2026-01-05' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Class cost', example: 50.0 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ description: 'Class type', example: 'attended', enum: ['attended', 'missed'] })
  @IsEnum(['attended', 'missed'])
  type: 'attended' | 'missed';

  @ApiProperty({ description: 'Semester', example: 'V' })
  @IsString()
  semester: string;

  @ApiProperty({ description: 'Teacher ID', example: 1 })
  @IsNumber()
  teacherId: number;
}

export class CreateStudentDto {
  @ApiProperty({ description: 'Student name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Student email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Student phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Payment records',
    example: [{ date: '2026-01-05', amount: 100.0, comment: 'Monthly payment' }],
    default: [],
    type: [PaymentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments: PaymentDto[];

  @ApiProperty({
    description: 'Class records',
    example: [{ date: '2026-01-05', cost: 50.0, type: 'attended', semester: 'V', teacherId: 1 }],
    default: [],
    type: [ClassDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassDto)
  classes: ClassDto[];

  @ApiPropertyOptional({
    description: 'Debit records',
    example: [
      { id: 1, dueDate: '2026-01-31', amount: 100.0, comment: 'January fee' }
    ],
    default: [],
    type: [DebitDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DebitDto)
  debits?: DebitDto[];

  @ApiPropertyOptional({
    description: 'Custom rate for this student',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customRate?: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ description: 'Current semester', example: 'V' })
  @IsString()
  semester: string;

  @ApiProperty({ description: 'Additional notes', example: '', default: '' })
  @IsString()
  extraNotes: string;

  @ApiProperty({ description: 'Student active status', example: true, default: true })
  @IsBoolean()
  active: boolean;
}
