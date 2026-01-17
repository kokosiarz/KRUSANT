import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDebitDto {

  @ApiProperty({ type: 'date', example: '2026-01-15' })
  @IsDateString()
  dueDate: Date;


  @ApiProperty({ type: 'number', example: 100.50 })
  @IsNumber()
  amount: number;


  @ApiPropertyOptional({ type: 'string', example: 'Some comment' })
  @IsOptional()
  @IsString()
  comment?: string;


  @ApiPropertyOptional({ type: 'string', example: 'Scholarship' })
  @IsOptional()
  @IsString()
  entitlement?: string;


  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  studentId: number;
}
