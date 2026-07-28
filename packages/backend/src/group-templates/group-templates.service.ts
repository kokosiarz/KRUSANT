import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupTemplate } from './group-template.entity';
import { CreateGroupTemplateDto } from './dto/create-group-template.dto';
import { UpdateGroupTemplateDto } from './dto/update-group-template.dto';

@Injectable()
export class GroupTemplatesService {
  constructor(
    @InjectRepository(GroupTemplate)
    private groupTemplateRepository: Repository<GroupTemplate>,
  ) {}

  async findAll(): Promise<GroupTemplate[]> {
    return await this.groupTemplateRepository.find();
  }

  async findOne(id: number): Promise<GroupTemplate> {
    const template = await this.groupTemplateRepository.findOne({
      where: { id },
    });
    if (!template)
      throw new NotFoundException(`Group template ${id} not found`);
    return template;
  }

  async create(createDto: CreateGroupTemplateDto): Promise<GroupTemplate> {
    const entity = this.groupTemplateRepository.create(createDto);
    return await this.groupTemplateRepository.save(entity);
  }

  async update(
    id: number,
    updateDto: UpdateGroupTemplateDto,
  ): Promise<GroupTemplate> {
    await this.groupTemplateRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.groupTemplateRepository.delete(id);
  }
}
