import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Student } from '../students/student.entity';

@Entity('class')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // ISO datetime string (e.g., 2026-01-06T10:00:00.000Z)
  @Column()
  startTime: string;

  // HH:mm format
  @Column()
  lessonLength: string;

  @Column({ nullable: true })
  roomId?: number;

  @Column({ nullable: true })
  groupId?: number;

  @Column({ nullable: true })
  teacherId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'json', default: '[]' })
  attendedStudentsIds: number[];

  @Column({ type: 'json', default: '[]' })
  plannedStudentsIds?: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
