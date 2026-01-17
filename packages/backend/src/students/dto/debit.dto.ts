import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class DebitDto {
  @ApiProperty({ description: 'Debit ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Due date', example: '2026-01-31' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Amount', example: 100.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Comment', example: 'January fee' })
  @IsOptional()
  @IsString()
  comment?: string;
}
