import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Settings } from './settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('settings')
@Controller('settings')
@Roles(Role.Admin)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Roles() // any authenticated role can read (currency/institution name shown app-wide); update stays admin-only
  @Get()
  async get(): Promise<Settings> {
    return this.service.get();
  }

  @Put()
  async update(@Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.service.update(dto);
  }
}
