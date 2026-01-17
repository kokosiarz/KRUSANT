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
import { GroupTemplatesService } from './group-templates.service';
import { CreateGroupTemplateDto } from './dto/create-group-template.dto';
import { UpdateGroupTemplateDto } from './dto/update-group-template.dto';

@ApiTags('group-templates')
@Controller('group-templates')
export class GroupTemplatesController {
  constructor(private readonly groupTemplatesService: GroupTemplatesService) {}

  @ApiOperation({ summary: 'Get all group templates' })
  @ApiResponse({ status: 200, description: 'Returns all group templates' })
  @Get()
  async getAll() {
    return await this.groupTemplatesService.findAll();
  }

  @ApiOperation({ summary: 'Get group template by ID' })
  @ApiParam({ name: 'id', description: 'Group template ID' })
  @ApiResponse({ status: 200, description: 'Returns group template' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.groupTemplatesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create new group template' })
  @ApiBody({ type: CreateGroupTemplateDto })
  @ApiResponse({ status: 201, description: 'Group template created' })
  @Post()
  async create(@Body() body: CreateGroupTemplateDto) {
    return await this.groupTemplatesService.create(body);
  }

  @ApiOperation({ summary: 'Update group template' })
  @ApiParam({ name: 'id', description: 'Group template ID' })
  @ApiBody({ type: UpdateGroupTemplateDto })
  @ApiResponse({ status: 200, description: 'Group template updated' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateGroupTemplateDto) {
    return await this.groupTemplatesService.update(+id, body);
  }

  @ApiOperation({ summary: 'Delete group template' })
  @ApiParam({ name: 'id', description: 'Group template ID' })
  @ApiResponse({ status: 200, description: 'Group template deleted' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.groupTemplatesService.remove(+id);
    return { message: 'Group template deleted successfully' };
  }
}
