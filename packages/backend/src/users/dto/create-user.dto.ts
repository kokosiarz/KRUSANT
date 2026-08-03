import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Display name', example: 'Jan Kowalski' })
  @IsOptional()
  @IsString()
  name?: string;

  // No password field on purpose: the server generates a temporary one and
  // emails it. An admin never picks, sees, or transmits a chosen password.

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['teacher', 'admin'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Student ID if linking to student profile',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  studentId?: number;
}
