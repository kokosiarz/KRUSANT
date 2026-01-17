import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class GroupTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateName: string;

  @Column({ nullable: true, default: true })
  isActive?: boolean;

  @Column({ type: 'json', nullable: true, default: null })
  studentIds?: number[] | null;

  @Column({ type: 'json', nullable: true, default: null })
  classIds?: number[] | null;

  @Column({ nullable: true })
  teacherId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'text', nullable: true, default: null })
  comment?: string | null;

  @Column({ type: 'json', nullable: true, default: null })
  minStartDate?: { day: number; month: number; year?: number } | null;

  @Column({ type: 'json', nullable: true, default: null })
  maxEndDate?: { day: number; month: number; year?: number } | null;

  @Column({ type: 'text', nullable: true, default: null })
  colorHex?: string | null;

  @Column({ type: 'time', nullable: true })
  startHour?: string | null;

  @Column({ type: 'time', nullable: true })
  lessonLength?: string | null;

  @Column({ type: 'integer', nullable: true })
  roomId?: number | null;

  @Column({ type: 'integer', nullable: true })
  courseId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
