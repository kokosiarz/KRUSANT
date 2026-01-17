import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { Student } from '../students/student.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Allowed values: 'receipt' | 'invoice'
  @Column({ type: 'text' })
  proofType: 'receipt' | 'invoice';

    @Column({ type: 'boolean', default: false })
    fiscalized: boolean;

    @Column({ type: 'int', nullable: true })
    invoiceId?: number;

  @Column()
  studentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
