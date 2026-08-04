import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LoggedEntity, LoggedOperation } from './action-log.constants';

/**
 * One recorded write, with enough state to reverse it.
 *
 * `before`/`after` hold the *API-level* shape of the record (what
 * GroupsService/ClassesService return, including studentIds and rosters) rather
 * than raw table rows, so an undo can be replayed through the same service
 * methods that handle membership — no second code path that could drift.
 */
@Entity('action_log')
export class ActionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  at: Date;

  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  // Denormalised so the log still reads correctly after an account is deleted.
  @Column({ type: 'varchar', nullable: true })
  userEmail: string | null;

  @Index()
  @Column({ type: 'varchar' })
  entity: LoggedEntity;

  @Column({ type: 'integer' })
  entityId: number;

  @Column({ type: 'varchar' })
  operation: LoggedOperation;

  /** Human-readable summary, rendered in the history list. */
  @Column({ type: 'varchar' })
  label: string;

  /** State before the write. Null for a create. */
  @Column({ type: 'json', nullable: true })
  before: Record<string, any> | null;

  /** State after the write. Null for a delete. */
  @Column({ type: 'json', nullable: true })
  after: Record<string, any> | null;

  /**
   * `updatedAt` of the record immediately after this write. Undo requires the
   * row to still carry this value — if it doesn't, somebody has changed the
   * record since and undoing would silently discard their work.
   */
  @Column({ type: 'datetime', nullable: true })
  afterUpdatedAt: Date | null;

  @Column({ type: 'integer' })
  schemaVersion: number;

  /** Set once this entry has been undone, so it can't be applied twice. */
  @Column({ type: 'datetime', nullable: true })
  undoneAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  undoneByUserId: number | null;
}
