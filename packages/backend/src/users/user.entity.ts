import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  // Comma-separated roles (Admin,Teacher,Student)
  @Column({ type: 'simple-array', default: '' })
  roles: string[];

  // Link to teacher profile if applicable (optional)
  @Column({ type: 'integer', nullable: true })
  teacherId?: number | null;

  // Link to student profile if applicable (optional)
  @Column({ type: 'integer', nullable: true })
  studentId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
