import { BatchUpsertCourseDto } from './dto/batch-upsert-course.dto';
import {
  Body,
  Controller,
  Param,
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
  ApiBody,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Returns all courses' })
  @Get()
  async getAll() {
    return await this.coursesService.findAll();
  }

  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Returns course' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.coursesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create new course' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created' })
  @Post()
  async create(@Body() course: CreateCourseDto) {
    return await this.coursesService.create(course);
  }

  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() course: UpdateCourseDto) {
    return await this.coursesService.update(+id, course);
  }

  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    await this.coursesService.remove(+id);
    return { message: 'Course deleted successfully' };
  }

  @ApiOperation({ summary: 'Batch create or update courses by name' })
  @ApiBody({ type: BatchUpsertCourseDto })
  @ApiResponse({
    status: 200,
    description:
      'Courses created/updated. Returns count and the processed courses.',
  })
  @Post('batch-upsert')
  async batchUpsert(@Body() batchDto: BatchUpsertCourseDto) {
    return await this.coursesService.batchUpsert(batchDto.courses);
  }
}
