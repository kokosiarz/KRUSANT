import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debit } from './debit.entity';

@Injectable()
export class DebitsService {
  constructor(
    @InjectRepository(Debit)
    private debitsRepository: Repository<Debit>,
  ) {}

  async create(debitData: Partial<Debit>): Promise<Debit> {
    const debit = this.debitsRepository.create(debitData);
    return this.debitsRepository.save(debit);
  }

  async findAll(): Promise<Debit[]> {
    return this.debitsRepository.find();
  }

  async findOne(id: number): Promise<Debit> {
    return this.debitsRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Debit>): Promise<Debit> {
    await this.debitsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.debitsRepository.delete(id);
  }
}
