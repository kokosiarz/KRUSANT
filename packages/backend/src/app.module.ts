import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './students/student.entity';
import { GroupsModule } from './groups/groups.module';
import { Group } from './groups/group.entity';
import { TeachersModule } from './teachers/teachers.module';
import { Teacher } from './teachers/entities/teacher.entity';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/course.entity';
import { RoomsModule } from './rooms/rooms.module';
import { Room } from './rooms/room.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/payment.entity';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { ClassEntity } from './classes/class.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { GroupTemplatesModule } from './group-templates/group-templates.module';
import { GroupTemplate } from './group-templates/group-template.entity';
import { SettingsModule } from './settings/settings.module';
import { Settings } from './settings/settings.entity';
import { DebitsModule } from './debits/debits.module';
import { Debit } from './debits/debit.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      // entities: ['dist/**/*.entity{.ts,.js}'],
      entities: [
        Student,
        Group,
        Teacher,
        Course,
        ClassEntity,
        Room,
        GroupTemplate,
        Settings,
        User,
        Payment,
        Debit,
      ],
      synchronize: true,
    }),
    StudentsModule,
    PaymentsModule,
    GroupsModule,
    TeachersModule,
    CoursesModule,
    RoomsModule,
    ClassesModule,
    GroupTemplatesModule,
    SettingsModule,
    AuthModule,
    UsersModule,
    DebitsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
