import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateRoomDto } from './create-room.dto';

export class BatchUpsertRoomDto {
  @ApiProperty({
    description: 'Array of rooms to create or update',
    type: [CreateRoomDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  rooms: CreateRoomDto[];
}
