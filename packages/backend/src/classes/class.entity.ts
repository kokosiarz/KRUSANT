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

  // The planned roster is a real join table rather than a JSON array, so
  // deleting a student cleans up after itself instead of leaving an orphaned
  // id embedded in every class forever. The API still speaks
  // plannedStudentsIds — see ClassesService.toResponse.
  //
  // Attendance itself (obecność/nieobecność/przełożone) is NOT a relation
  // here — it needs a per-student status, which a plain @ManyToMany join
  // table has no room for. See ClassAttendance (class-attendance.entity.ts).
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
