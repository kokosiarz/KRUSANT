import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClassEntity } from './class.entity';
import { Student } from '../students/student.entity';

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Rescheduled = 'rescheduled',
}

// One row per (class, student) that has been marked. A student with no row
// here is simply unmarked — the same "absence of a row means absence of a
// fact" convention the old class_attended_students join table used, just with
// a status attached instead of the row itself being the only signal. That's
// also why this had to become a real entity rather than staying a plain
// @ManyToMany/@JoinTable like class_planned_students still is: a join table
// has no room for a column.
//
// Billing (ClassesService.setAttendance): present and absent both consume a
// scheduled lesson and create a debit; rescheduled does not — it instead
// counts toward the student's outstanding make-up balance, computed in
// StudentsService.findAllWithBalance.
@Entity('class_attendance')
export class ClassAttendance {
  @PrimaryColumn()
  classId: number;

  @PrimaryColumn()
  studentId: number;

  @Column({ type: 'varchar' })
  status: AttendanceStatus;

  // Relations exist so `synchronize: true` test databases get the same
  // ON DELETE CASCADE the migration gives production — the service itself
  // reads/writes the plain classId/studentId columns and never loads these.
  @ManyToOne(() => ClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class?: ClassEntity;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student?: Student;
}
