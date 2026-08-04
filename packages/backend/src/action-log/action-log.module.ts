import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLog } from './action-log.entity';
import { ActionLogService } from './action-log.service';
import { ActionLogController } from './action-log.controller';

// Global so Groups/Classes can inject the service without importing this
// module, and so the dependency only ever points one way: they know about the
// log, the log learns about them through registerHandler at startup.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActionLog])],
  controllers: [ActionLogController],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}
