import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', default: '[]' })
  studentIds: number[];

  @Column({ type: 'json', default: '[]' })
  classIds: number[];

  @Column({ type: 'json', nullable: true })
  minStartDate: { day: number; month: number; year?: number } | null;

  @Column({ type: 'json', nullable: true })
  maxEndDate: { day: number; month: number; year?: number } | null;

  @Column()
  teacherId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'integer', nullable: true })
  numberOfHours?: number | null;

  @Column({ type: 'int', nullable: true })
  roomId?: number | null;

  @Column({ type: 'text', default: '' })
  comment: string;

  @Column({ type: 'text', nullable: true, default: null })
  colorHex: string | null;

  @Column({ type: 'time', nullable: true })
  startHour?: string | null;

  @Column({ type: 'time', nullable: true })
  lessonLength?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
