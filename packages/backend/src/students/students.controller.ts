import { Body, Controller, Param, Query } from '@nestjs/common';
import { Get, Post, Patch, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BatchUpsertStudentDto } from './dto/batch-upsert-student.dto';
import { StudentsService } from './students.service';
import { StudentWithBalanceDto } from './dto/student-with-balance.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

function parseActiveFilter(active?: 'true' | 'false'): boolean | undefined {
  if (active === 'true') return true;
  if (active === 'false') return false;
  return undefined;
}

@ApiTags('students')
@Controller('students')
@Roles(Role.Admin) // default: admin-only; read overridden below for teachers
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({
    name: 'active',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all students or filtered by active status',
  })
  @Roles(Role.Admin, Role.Teacher)
  @Get()
  async getAll(@Query('active') active?: 'true' | 'false') {
    return await this.studentsService.findAll(parseActiveFilter(active));
  }

  @ApiOperation({ summary: 'Get all students with financial balance' })
  @ApiQuery({
    name: 'active',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all students with their financial balance',
    type: [StudentWithBalanceDto],
  })
  @Roles(Role.Admin, Role.Teacher)
  @Get('with-balance')
  async getAllWithBalance(@Query('active') active?: 'true' | 'false') {
    return await this.studentsService.findAllWithBalance(parseActiveFilter(active));
  }

  @ApiOperation({ summary: 'Get student by email' })
  @ApiQuery({
    name: 'email',
    description: 'Student email',
    example: 'student@example.com',
  })
  @ApiResponse({ status: 200, description: 'Returns student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Roles(Role.Admin, Role.Teacher)
  @Get('search')
  async getByEmail(@Query('email') email: string) {
    return await this.studentsService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Returns student' })
  @Roles(Role.Admin, Role.Teacher)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.studentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create new student' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Student created' })
  @Post()
  async create(@Body() student: CreateStudentDto) {
    return await this.studentsService.create(student);
  }

  @ApiOperation({ summary: 'Update student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Student updated' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() student: UpdateStudentDto) {
    return await this.studentsService.update(+id, student);
  }

  @ApiOperation({ summary: 'Delete student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student deleted' })
  @Delete(':id')
  async deleteStudent(@Param('id') id: string) {
    await this.studentsService.remove(+id);
    return { message: 'Student deleted successfully' };
  }

  @ApiOperation({ summary: 'Batch create or update students by email' })
  @ApiBody({ type: BatchUpsertStudentDto })
  @ApiResponse({
    status: 200,
    description:
      'Students created/updated. Returns count and the processed students.',
  })
  @Post('batch-upsert')
  async batchUpsert(@Body() batchDto: BatchUpsertStudentDto) {
    return await this.studentsService.batchUpsert(batchDto.students);
  }
}
