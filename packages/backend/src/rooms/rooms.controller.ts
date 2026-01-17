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
import { RoomsService } from './rooms.service';
import { BatchUpsertRoomDto } from './dto/batch-upsert-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Returns all rooms' })
  @Get()
  async getAll() {
    return await this.roomsService.findAll();
  }

  @ApiOperation({ summary: 'Get room by ID' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Returns room' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.roomsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create new room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Room created' })
  @Post()
  async create(@Body() body: CreateRoomDto) {
    return await this.roomsService.create(body);
  }

  @ApiOperation({ summary: 'Update room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Room updated' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRoomDto) {
    return await this.roomsService.update(+id, body);
  }

  @ApiOperation({ summary: 'Delete room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.roomsService.remove(+id);
    return { message: 'Room deleted successfully' };
  }

  @ApiOperation({ summary: 'Batch create or update rooms by name' })
  @ApiBody({ type: BatchUpsertRoomDto })
  @ApiResponse({
    status: 200,
    description:
      'Rooms created/updated. Returns count and the processed rooms.',
  })
  @Post('batch-upsert')
  async batchUpsert(@Body() batchDto: BatchUpsertRoomDto) {
    return await this.roomsService.batchUpsert(batchDto.rooms);
  }
}
