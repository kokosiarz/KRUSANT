import { Body, Controller, Post } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Controller('auth')
export class TeachersController {
  @Post('signup')
  createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    console.log(createTeacherDto);
    return 'signup';
  }
}
