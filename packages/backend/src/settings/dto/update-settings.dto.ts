import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Institution name' })
  @IsOptional()
  @IsString()
  institutionName?: string;

  @ApiPropertyOptional({ description: 'Currency code or name' })
  @IsOptional()
  @IsString()
  currency?: string;
}
