import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created', type: Payment })
  create(@Body() paymentData: CreatePaymentDto) {
    return this.paymentsService.create(paymentData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'List of payments', type: [Payment] })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get payments by student id' })
  @ApiParam({ name: 'studentId', type: Number })
  @ApiResponse({ status: 200, description: 'Payments for student', type: [Payment] })
  findByStudent(@Param('studentId') studentId: number) {
    return this.paymentsService.findByStudent(Number(studentId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Payment found', type: Payment })
  findOne(@Param('id') id: number) {
    return this.paymentsService.findOne(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Payment updated', type: Payment })
  update(@Param('id') id: number, @Body() updateData: UpdatePaymentDto) {
    return this.paymentsService.update(Number(id), updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  remove(@Param('id') id: number) {
    return this.paymentsService.remove(Number(id));
  }
}
