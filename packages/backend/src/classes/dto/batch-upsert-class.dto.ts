import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateClassDto } from './create-class.dto';

export class BatchUpsertClassDto {
  @ApiProperty({
    description: 'Array of classes to create or update',
    type: [CreateClassDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClassDto)
  classes: CreateClassDto[];
}
