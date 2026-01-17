import { Body, Controller, Post, Delete, Param, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeachersService } from './teachers.service';
import { BatchUpsertTeacherDto } from './dto/batch-upsert-teacher.dto';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Returns all teachers' })
  @Get()
  getAllTeachers() {
    return this.teachersService.findAll();
  }

  @ApiOperation({ summary: 'Create new teacher' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post('/signup')
  createTeacher(@Body() body: CreateTeacherDto) {
    return this.teachersService.create(body);
  }

  @ApiOperation({ summary: 'Delete teacher' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({ status: 200, description: 'Teacher deleted successfully' })
  @Delete(':id')
  deleteTeacher(@Param('id') id: string) {
    return this.teachersService.remove(parseInt(id));
  }

  @ApiOperation({ summary: 'Batch create or update teachers by email' })
  @ApiBody({ type: BatchUpsertTeacherDto })
  @ApiResponse({
    status: 200,
    description:
      'Teachers created/updated. Returns count and the processed teachers.',
  })
  @Post('batch-upsert')
  batchUpsert(@Body() batchDto: BatchUpsertTeacherDto) {
    return this.teachersService.batchUpsert(batchDto.teachers);
  }
}
