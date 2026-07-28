import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Query,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { BatchUpsertClassDto } from './dto/batch-upsert-class.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('classes')
@Controller('classes')
@Roles(Role.Admin) // default: admin-only; read + attendance overridden below for teachers
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @ApiOperation({ summary: 'Get all classes' })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filter by group ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all classes or filtered by group ID',
  })
  @Roles(Role.Admin, Role.Teacher)
  @Get()
  async getAll(@Query('groupId') groupId?: string) {
    const gid = groupId !== undefined ? Number(groupId) : undefined;
    return await this.classesService.findAll(gid);
  }

  @ApiOperation({ summary: 'Get class by ID' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Returns class' })
  @Roles(Role.Admin, Role.Teacher)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.classesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new class' })
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({ status: 201, description: 'Class created' })
  @Post()
  async create(@Body() body: CreateClassDto) {
    return await this.classesService.create(body);
  }

  @ApiOperation({ summary: 'Update class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({ status: 200, description: 'Class updated' })
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateClassDto) {
    return await this.classesService.update(id, body);
  }

  @ApiOperation({ summary: 'Delete class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.classesService.remove(id);
    return { message: 'Class deleted successfully' };
  }

  @ApiOperation({ summary: 'Set attendance for a class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiBody({ type: [Number] })
  @ApiResponse({ status: 200, description: 'Attendance set, returns class and created debits' })
  @Roles(Role.Admin, Role.Teacher) // marking attendance is a normal teaching-day task, not an admin one
  @Post(':id/attendance')
  async setAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() attendedStudentsIds: number[],
  ) {
    return await this.classesService.setAttendance(id, attendedStudentsIds);
  }

  @ApiOperation({
    summary: 'Batch create or update classes by startTime and roomId',
  })
  @ApiBody({ type: BatchUpsertClassDto })
  @ApiResponse({
    status: 200,
    description:
      'Classes created/updated. Returns count and the processed classes.',
  })
  @Post('batch-upsert')
  async batchUpsert(@Body() batchDto: BatchUpsertClassDto) {
    return await this.classesService.batchUpsert(batchDto.classes);
  }

  @ApiOperation({ summary: 'Batch create classes' })
  @ApiBody({ type: [CreateClassDto] })
  @ApiResponse({ status: 201, description: 'Classes created' })
  @Post('batch')
  async batchCreate(@Body() classes: CreateClassDto[]) {
    return await this.classesService.batchCreate(classes);
  }
}
