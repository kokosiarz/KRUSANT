import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTemplate } from './group-template.entity';
import { GroupTemplatesService } from './group-templates.service';
import { GroupTemplatesController } from './group-templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GroupTemplate])],
  controllers: [GroupTemplatesController],
  providers: [GroupTemplatesService],
})
export class GroupTemplatesModule {}
