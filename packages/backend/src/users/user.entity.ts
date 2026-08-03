import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // Display name. Nullable because accounts created before this column
  // existed have none; the UI falls back to the email address.
  @Column({ type: 'varchar', nullable: true })
  name?: string | null;

  @Column()
  passwordHash: string;

  // Comma-separated roles (Admin,Teacher,Student). A user with the 'teacher'
  // role *is* the teacher — there is no separate teacher table.
  @Column({ type: 'simple-array', default: '' })
  roles: string[];

  // Link to student profile if applicable (optional)
  @Column({ type: 'integer', nullable: true })
  studentId?: number | null;

  // Set when an admin issues a temporary password. While true the user can
  // reach nothing but /auth/profile, /auth/logout and /auth/change-password
  // (see ForcePasswordChangeGuard) — changing the password clears both fields.
  @Column({ type: 'boolean', default: false })
  mustChangePassword: boolean;

  // Deadline for using the temporary password (24h from issue). Past this the
  // password stops working and an admin has to issue a new one. Null for
  // accounts whose password is self-chosen, and for Google-only accounts.
  @Column({ type: 'datetime', nullable: true })
  tempPasswordExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
