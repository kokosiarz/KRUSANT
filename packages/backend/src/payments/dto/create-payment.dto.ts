import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, IsDateString } from 'class-validator';

export class CreatePaymentDto {

  @ApiProperty({ type: 'date', example: '2026-01-15' })
  @IsDateString()
  date: string;


  @ApiProperty({ type: 'number', example: 100.50 })
  @IsNumber()
  amount: number;


  @ApiPropertyOptional({ type: 'string', example: 'Some comment' })
  @IsOptional()
  @IsString()
  comment?: string;


  @ApiProperty({ enum: ['receipt', 'invoice'], example: 'receipt' })
  @IsString()
  @IsIn(['receipt', 'invoice'])
  proofType: 'receipt' | 'invoice';


  @ApiProperty({ type: 'boolean', example: false })
  @IsBoolean()
  fiscalized: boolean;


  @ApiPropertyOptional({ type: 'number', example: 123 })
  @IsOptional()
  @IsNumber()
  invoiceId?: number;


  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  studentId: number;
}
