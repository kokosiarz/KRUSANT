
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Debit } from '../debits/debit.entity';
import { Payment } from '../payments/payment.entity';
import { ClassEntity } from '../classes/class.entity';

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

  @OneToMany(() => Debit, (debit) => debit.student)
  debits: Debit[];

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  @ManyToMany(() => ClassEntity, (classEntity) => classEntity.attendedStudentsIds)
  @JoinTable()
  classes: ClassEntity[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  customRate: number;

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
