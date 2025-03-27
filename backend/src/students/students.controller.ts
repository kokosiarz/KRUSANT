import { Body, Controller, Param, Query } from '@nestjs/common';
import { Get, Post, Patch, Delete } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  @Get()
  getAll(@Query('late') late?: 'true' | 'false') {
    return [late];
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { id };
  }

  @Post()
  create(@Body() student: {}) {
    return student;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() student: {}) {
    // logic to update a student
    console.log('patching: ', id, student);
  }

  @Delete(':id')
  deleteStudent(@Param('id') id: string) {
    return { id };
  }
}
