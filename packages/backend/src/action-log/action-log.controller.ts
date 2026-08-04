import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActionLogService } from './action-log.service';
import { ACTION_LOG_PAGE_SIZE } from './action-log.constants';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('history')
@ApiBearerAuth()
@Controller('history')
// Admin-only: the log names who did what, which is management information.
@Roles(Role.Admin)
export class ActionLogController {
  constructor(private readonly actionLog: ActionLogService) {}

  @ApiOperation({ summary: 'Recent recorded actions, newest first' })
  @ApiResponse({ status: 200, description: 'History entries' })
  @Get()
  async list(@Query('limit') limit?: string) {
    const parsed = limit ? Number(limit) : ACTION_LOG_PAGE_SIZE;
    const take = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), 500)
      : ACTION_LOG_PAGE_SIZE;
    return this.actionLog.list(take);
  }

  @ApiOperation({ summary: 'Undo a recorded action' })
  @ApiResponse({ status: 200, description: 'Undone' })
  @ApiResponse({
    status: 409,
    description: 'The record changed since — undo refused.',
  })
  @Post(':id/undo')
  async undo(@Param('id', ParseIntPipe) id: number, @Request() request) {
    return this.actionLog.undo(id, request.user);
  }
}
