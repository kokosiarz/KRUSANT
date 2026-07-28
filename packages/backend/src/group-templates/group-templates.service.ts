import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupTemplate } from './group-template.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class GroupTemplatesService extends BaseCrudService<GroupTemplate> {
  constructor(
    @InjectRepository(GroupTemplate)
    groupTemplateRepository: Repository<GroupTemplate>,
  ) {
    super(groupTemplateRepository, {
      entityName: 'Group template',
      uniqueBy: 'templateName',
    });
  }
}
