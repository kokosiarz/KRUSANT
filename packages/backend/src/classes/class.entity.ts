import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
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

  // Attendance and the planned roster are real join tables rather than JSON
  // arrays, so deleting a student cleans up after itself instead of leaving an
  // orphaned id embedded in every class forever. The API still speaks
  // attendedStudentsIds/plannedStudentsIds — see ClassesService.toResponse.
  @ManyToMany(() => Student)
  @JoinTable({
    name: 'class_attended_students',
    joinColumn: { name: 'classId' },
    inverseJoinColumn: { name: 'studentId' },
  })
  attendedStudents: Student[];

  @ManyToMany(() => Student)
  @JoinTable({
    name: 'class_planned_students',
    joinColumn: { name: 'classId' },
    inverseJoinColumn: { name: 'studentId' },
  })
  plannedStudents: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
