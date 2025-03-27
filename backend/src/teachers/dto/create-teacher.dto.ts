import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherDto {
  name: string;
  email: string;
  password: string;
}
