import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TeachersController } from './teachers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, TeachersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
