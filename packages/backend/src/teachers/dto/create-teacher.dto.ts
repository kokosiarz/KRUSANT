import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  // @IsNumber()
  // @IsNotEmpty()
  // id: number;
  @ApiProperty({ description: 'Teacher name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ description: 'Teacher email', example: 'teacher@example.com' })
  @IsEmail()
  email: string;
  logInsert() {
    console.log('Inserted teacher with name', this.name);
  }
  logUpdate() {
    console.log('Updated teacher with name', this.name);
  }
  logRemove() {
    console.log('Removed teacher with name', this.name);
  }
}
