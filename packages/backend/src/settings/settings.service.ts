import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly repo: Repository<Settings>,
  ) {}

  async get(): Promise<Settings> {
    // Ensure a single settings row exists (id = 1)
    let current = await this.repo.findOne({ where: { id: 1 } });
    if (!current) {
      current = this.repo.create({ id: 1, institutionName: 'Institution', currency: 'PLN' });
      await this.repo.save(current);
    }
    return current;
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    const current = await this.get();
    Object.assign(current, dto);
    return this.repo.save(current);
  }
}
