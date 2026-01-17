import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './class.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { DebitsModule } from '../debits/debits.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity]),
    DebitsModule,
    forwardRef(() => GroupsModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
