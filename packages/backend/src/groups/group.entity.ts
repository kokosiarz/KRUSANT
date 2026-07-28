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
import { ClassEntity } from '../classes/class.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  // Junction tables created via @JoinTable() default to ON DELETE CASCADE on
  // both FKs (confirmed against Student.classes below, which relies on the
  // same default) — deleting a Group/Student/Class cleans up membership rows
  // automatically instead of leaving a dangling id like the old JSON arrays did.
  @ManyToMany(() => Student)
  @JoinTable({
    name: 'group_students',
    joinColumn: { name: 'groupId' },
    inverseJoinColumn: { name: 'studentId' },
  })
  students: Student[];

  @ManyToMany(() => ClassEntity)
  @JoinTable({
    name: 'group_classes',
    joinColumn: { name: 'groupId' },
    inverseJoinColumn: { name: 'classId' },
  })
  classes: ClassEntity[];

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
