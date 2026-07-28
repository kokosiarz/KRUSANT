import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from './groups/groups.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { RoomsModule } from './rooms/rooms.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { UsersModule } from './users/users.module';
import { GroupTemplatesModule } from './group-templates/group-templates.module';
import { SettingsModule } from './settings/settings.module';
import { DebitsModule } from './debits/debits.module';
import { PassportJwtAuthGuard } from './auth/guards/passport-jwt.guard';
import { RolesGuard } from './auth/roles.guard';
import { entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      entities,
      synchronize: false,
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
  providers: [
    AppService,
    AuthService,
    { provide: APP_GUARD, useClass: PassportJwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
