import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Debit } from '../debits/debit.entity';
import { Payment } from '../payments/payment.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Debit, (debit) => debit.studentId)
  debits: Debit[];

  @OneToMany(() => Payment, (payment) => payment.studentId)
  payments: Payment[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column()
  semester: string;

  @Column({ type: 'text', default: '' })
  extraNotes: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
