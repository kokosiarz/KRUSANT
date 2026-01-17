import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debit } from './debit.entity';
import { DebitsService } from './debits.service';
import { DebitsController } from './debits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Debit])],
  providers: [DebitsService],
  controllers: [DebitsController],
  exports: [DebitsService],
})
export class DebitsModule {}
