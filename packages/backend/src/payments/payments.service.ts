import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentsRepository.create(paymentData);
    return this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find();
  }

  async findByStudent(studentId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({ where: { studentId } });
  }

  async findOne(id: number): Promise<Payment> {
    return this.paymentsRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Payment>): Promise<Payment> {
    await this.paymentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.paymentsRepository.delete(id);
  }
}
