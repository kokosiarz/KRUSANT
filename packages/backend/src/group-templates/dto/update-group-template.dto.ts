import { PartialType } from '@nestjs/swagger';
import { CreateGroupTemplateDto } from './create-group-template.dto';

export class UpdateGroupTemplateDto extends PartialType(CreateGroupTemplateDto) {}
