import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './class.entity';
import { ClassAttendance } from './class-attendance.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Debit } from '../debits/debit.entity';
import { Student } from '../students/student.entity';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity, ClassAttendance, Debit, Student]),
    forwardRef(() => GroupsModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
