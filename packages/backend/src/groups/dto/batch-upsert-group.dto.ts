import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';

export class BatchUpsertGroupDto {
  @ApiProperty({
    description: 'Array of groups to create or update',
    type: [CreateGroupDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGroupDto)
  groups: CreateGroupDto[];
}
