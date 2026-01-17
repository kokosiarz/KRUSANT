import {
  Body,
  Controller,
  Param,
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
import { GroupsService } from './groups.service';
import { BatchUpsertGroupDto } from './dto/batch-upsert-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Get all groups' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all groups or filtered by active status',
  })
  @Get()
  async getAll(@Query('isActive') isActive?: 'true' | 'false') {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return await this.groupsService.findAll(active);
  }

  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Returns group' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.groupsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create new group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Group created' })
  @Post()
  async create(@Body() group: CreateGroupDto) {
    return await this.groupsService.create(group);
  }

  @ApiOperation({ summary: 'Update group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({ status: 200, description: 'Group updated' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() group: UpdateGroupDto) {
    return await this.groupsService.update(+id, group);
  }

  @ApiOperation({ summary: 'Delete group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    await this.groupsService.remove(+id);
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
