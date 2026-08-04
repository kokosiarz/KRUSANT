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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { BatchUpsertGroupDto } from './dto/batch-upsert-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('groups')
@Controller('groups')
@Roles(Role.Admin) // default: admin-only; read overridden below for teachers
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Get all groups (or templates)' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'isTemplate',
    required: false,
    enum: ['true', 'false'],
    description:
      'Return templates instead of real groups. Defaults to false, so plain /groups never includes templates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns groups (or templates when isTemplate=true)',
  })
  @Roles(Role.Admin, Role.Teacher)
  @Get()
  async getAll(
    @Query('isActive') isActive?: 'true' | 'false',
    @Query('isTemplate') isTemplate?: 'true' | 'false',
  ) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return await this.groupsService.findAll(isTemplate === 'true', active);
  }

  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Returns group' })
  @Roles(Role.Admin, Role.Teacher)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.groupsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Group created' })
  @Post()
  async create(@Body() group: CreateGroupDto, @Request() request) {
    return await this.groupsService.create(group, request.user);
  }

  @ApiOperation({ summary: 'Update group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({ status: 200, description: 'Group updated' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() group: UpdateGroupDto,
    @Request() request,
  ) {
    return await this.groupsService.update(id, group, request.user);
  }

  @ApiOperation({ summary: 'Delete group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  @Delete(':id')
  async deleteGroup(@Param('id', ParseIntPipe) id: number, @Request() request) {
    await this.groupsService.remove(id, request.user);
    return { message: 'Group deleted successfully' };
  }

  @ApiOperation({ summary: 'Batch create or update groups by name' })
  @ApiBody({ type: BatchUpsertGroupDto })
  @ApiResponse({
    status: 200,
    description:
      'Groups created/updated. Returns count and the processed groups.',
  })
  @Post('batch-upsert')
  async batchUpsert(@Body() batchDto: BatchUpsertGroupDto) {
    return await this.groupsService.batchUpsert(batchDto.groups);
  }
}
