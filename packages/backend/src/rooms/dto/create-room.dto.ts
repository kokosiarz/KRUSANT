import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room name', example: 'Room A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Capacity of the room', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;
}
