import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DebitsService } from './debits.service';
import { Debit } from './debit.entity';
import { CreateDebitDto } from './dto/create-debit.dto';
import { UpdateDebitDto } from './dto/update-debit.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('debits')
@Controller('debits')
@Roles(Role.Admin)
export class DebitsController {
  constructor(private readonly debitsService: DebitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new debit' })
  @ApiBody({ type: CreateDebitDto })
  @ApiResponse({ status: 201, description: 'Debit created', type: Debit })
  create(@Body() debitData: CreateDebitDto) {
    return this.debitsService.create(debitData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debits' })
  @ApiResponse({ status: 200, description: 'List of debits', type: [Debit] })
  findAll() {
    return this.debitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debit by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Debit found', type: Debit })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.debitsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update debit by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateDebitDto })
  @ApiResponse({ status: 200, description: 'Debit updated', type: Debit })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateDebitDto,
  ) {
    return this.debitsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debit by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Debit deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.debitsService.remove(id);
  }
}
