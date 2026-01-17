import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Settings } from './settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async get(): Promise<Settings> {
    return this.service.get();
  }

  @Put()
  async update(@Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.service.update(dto);
  }
}
