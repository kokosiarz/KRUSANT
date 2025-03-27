import { Body, Controller, Post } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('/signup')
  createTeacher(@Body() body: CreateTeacherDto) {
    this.teachersService.create(body);
    console.log(body);
    // return 'signup';
  }
}
