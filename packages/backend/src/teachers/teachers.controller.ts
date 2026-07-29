import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';
import { BatchUpsertTeacherDto } from './dto/batch-upsert-teacher.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('teachers')
@Controller('teachers')
@Roles(Role.Admin)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Returns all teachers' })
  @Roles() // override the controller-level admin restriction: any authenticated role can list teachers (used by TeacherSelector)
  @Get()
  getAllTeachers() {
    return this.teachersService.findAll();
  }

  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({ status: 200, description: 'Returns teacher' })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new teacher' })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  createTeacher(@Body() body: CreateTeacherDto) {
    return this.teachersService.create(body);
  }

  @ApiOperation({ summary: 'Update teacher' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({ status: 200, description: 'Teacher updated' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, body);
  }

  @ApiOperation({ summary: 'Delete teacher' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({ status: 200, description: 'Teacher deleted successfully' })
  @Delete(':id')
  deleteTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
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
