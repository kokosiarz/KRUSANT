import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionLog } from './action-log.entity';
import {
  ACTION_LOG_PAGE_SIZE,
  ACTION_LOG_SCHEMA_VERSION,
  LoggedEntity,
  LoggedOperation,
} from './action-log.constants';

export interface Actor {
  id?: number | string | null;
  email?: string | null;
}

export interface RecordParams {
  actor?: Actor;
  entity: LoggedEntity;
  entityId: number;
  operation: LoggedOperation;
  label: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
}

/**
 * What an undo needs from whichever module owns the entity. Groups and Classes
 * register one of these, so this service never has to know their table shapes.
 */
export interface UndoHandler {
  /** Current API-level state, or null if the record no longer exists. */
  load: (id: number) => Promise<Record<string, any> | null>;
  /** Re-create a deleted record, keeping its original id. */
  restore: (snapshot: Record<string, any>) => Promise<void>;
  /** Write a previous state back over the current one. */
  revert: (id: number, snapshot: Record<string, any>) => Promise<void>;
  /** Remove a record that was created. */
  remove: (id: number) => Promise<void>;
}

@Injectable()
export class ActionLogService {
  private readonly handlers = new Map<LoggedEntity, UndoHandler>();

  constructor(
    @InjectRepository(ActionLog)
    private readonly repo: Repository<ActionLog>,
  ) {}

  /**
   * Modules call this at startup. Keeps the dependency pointing one way —
   * Groups/Classes know about the log, the log doesn't import them (which would
   * be circular, since they call it on every write).
   */
  registerHandler(entity: LoggedEntity, handler: UndoHandler): void {
    this.handlers.set(entity, handler);
  }

  async record(params: RecordParams): Promise<void> {
    const { actor, before, after } = params;
    const entry = this.repo.create({
      userId: actor?.id != null ? Number(actor.id) : null,
      userEmail: actor?.email ?? null,
      entity: params.entity,
      entityId: params.entityId,
      operation: params.operation,
      label: params.label,
      before: before ?? null,
      after: after ?? null,
      afterUpdatedAt: parseUpdatedAt(after),
      schemaVersion: ACTION_LOG_SCHEMA_VERSION,
      undoneAt: null,
      undoneByUserId: null,
    });
    await this.repo.save(entry);
  }

  async list(limit = ACTION_LOG_PAGE_SIZE): Promise<
    (ActionLog & {
      undoable: boolean;
      notUndoableReason: string | null;
    })[]
  > {
    const entries = await this.repo.find({
      order: { at: 'DESC', id: 'DESC' },
      take: limit,
    });
    return entries.map((entry) => {
      const reason = this.staticUndoBlocker(entry);
      return { ...entry, undoable: reason === null, notUndoableReason: reason };
    });
  }

  /** Reasons we can tell without touching the record itself. */
  private staticUndoBlocker(entry: ActionLog): string | null {
    if (entry.undoneAt) return 'Ta operacja została już cofnięta.';
    if (entry.schemaVersion !== ACTION_LOG_SCHEMA_VERSION) {
      return 'Struktura bazy zmieniła się od tego czasu — cofnięcie nie jest już możliwe.';
    }
    if (!this.handlers.has(entry.entity)) {
      return 'Cofanie nie jest obsługiwane dla tego typu wpisu.';
    }
    return null;
  }

  async undo(id: number, actor?: Actor): Promise<{ message: string }> {
    const entry = await this.repo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Wpis historii nie istnieje.');

    const blocked = this.staticUndoBlocker(entry);
    if (blocked) throw new BadRequestException(blocked);

    const handler = this.handlers.get(entry.entity);
    const current = await handler.load(entry.entityId);

    // The conflict check. Everything below assumes the record is still exactly
    // as this entry left it; if it isn't, someone has edited it since and
    // undoing would throw their change away without telling them.
    if (entry.operation === 'delete') {
      if (current) {
        throw new ConflictException(
          'Rekord o tym identyfikatorze istnieje ponownie — cofnięcie zostało wstrzymane.',
        );
      }
      await handler.restore(entry.before);
    } else {
      if (!current) {
        throw new ConflictException(
          'Rekord został w międzyczasie usunięty — cofnięcie zostało wstrzymane.',
        );
      }
      const expected = entry.afterUpdatedAt;
      const actual = parseUpdatedAt(current);
      if (!expected || !actual || expected.getTime() !== actual.getTime()) {
        throw new ConflictException(
          'Ktoś zmienił ten rekord po tej operacji — cofnięcie zostało wstrzymane, aby nie nadpisać tamtych zmian.',
        );
      }

      if (entry.operation === 'create') {
        await handler.remove(entry.entityId);
      } else {
        await handler.revert(entry.entityId, entry.before);
      }
    }

    entry.undoneAt = new Date();
    entry.undoneByUserId = actor?.id != null ? Number(actor.id) : null;
    await this.repo.save(entry);

    return { message: 'Operacja została cofnięta.' };
  }
}

/**
 * SQLite hands `updatedAt` back as a string via JSON and as a Date via the
 * entity layer, so normalise before comparing — a string/Date mismatch would
 * otherwise read as a conflict on every single undo.
 */
function parseUpdatedAt(
  snapshot: Record<string, any> | null | undefined,
): Date | null {
  const raw = snapshot?.updatedAt;
  if (!raw) return null;
  const date = raw instanceof Date ? raw : new Date(String(raw));
  return Number.isNaN(date.getTime()) ? null : date;
}
