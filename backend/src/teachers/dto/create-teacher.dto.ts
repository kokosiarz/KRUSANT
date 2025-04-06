import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  logInsert() {
    console.log('Inserted teacher with id', this.id);
  }
  logUpdate() {
    console.log('Updated teacher with id', this.id);
  }
  logRemove() {
    console.log('Removed teacher with id', this.id);
  }
}
