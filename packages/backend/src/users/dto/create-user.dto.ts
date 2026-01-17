import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'User roles', example: ['teacher','admin'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ description: 'Teacher ID if linking to teacher profile', example: 1 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @ApiPropertyOptional({ description: 'Student ID if linking to student profile', example: 1 })
  @IsOptional()
  @IsNumber()
  studentId?: number;
}
