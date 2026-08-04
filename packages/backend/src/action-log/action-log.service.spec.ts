import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { ActionLogService, UndoHandler } from './action-log.service';
import { ActionLog } from './action-log.entity';
import { ACTION_LOG_SCHEMA_VERSION } from './action-log.constants';

describe('ActionLogService', () => {
  let service: ActionLogService;
  let dataSource: DataSource;

  /** Stand-in for Groups/Classes: an in-memory store with the same contract. */
  let store: Map<number, Record<string, any>>;
  let handler: UndoHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [ActionLog],
          synchronize: true,
          retryAttempts: 0,
        }),
        TypeOrmModule.forFeature([ActionLog]),
      ],
      providers: [ActionLogService],
    }).compile();

    service = module.get(ActionLogService);
    dataSource = module.get(DataSource);

    store = new Map();
    handler = {
      load: (id) => Promise.resolve(store.get(id) ?? null),
      restore: (snap) => {
        store.set(Number(snap.id), { ...snap });
        return Promise.resolve();
      },
      revert: (id, snap) => {
        store.set(id, { ...snap, updatedAt: new Date().toISOString() });
        return Promise.resolve();
      },
      remove: (id) => {
        store.delete(id);
        return Promise.resolve();
      },
    };
    service.registerHandler('group', handler);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  const AT = '2026-08-04T10:00:00.000Z';
  const record = (
    over: Partial<Parameters<ActionLogService['record']>[0]> = {},
  ) =>
    service.record({
      entity: 'group',
      entityId: 1,
      operation: 'update',
      label: 'Zmieniono grupę',
      before: { id: 1, name: 'Stara', updatedAt: '2026-08-04T09:00:00.000Z' },
      after: { id: 1, name: 'Nowa', updatedAt: AT },
      ...over,
    });

  const latestId = async () => (await service.list())[0].id;

  it('reverts an update to the previous state', async () => {
    store.set(1, { id: 1, name: 'Nowa', updatedAt: AT });
    await record();

    await service.undo(await latestId());

    expect(store.get(1)?.name).toBe('Stara');
  });

  // The whole reason for snapshots over inverse operations.
  it('refuses when someone else changed the record after the logged action', async () => {
    store.set(1, {
      id: 1,
      name: 'Ktoś inny to zmienił',
      updatedAt: '2026-08-04T11:30:00.000Z',
    });
    await record();

    await expect(service.undo(await latestId())).rejects.toBeInstanceOf(
      ConflictException,
    );
    // Their change survives untouched.
    expect(store.get(1)?.name).toBe('Ktoś inny to zmienił');
  });

  it('restores a deleted record with its original id', async () => {
    await record({
      operation: 'delete',
      before: { id: 7, name: 'Usunięta', updatedAt: AT },
      after: null,
      entityId: 7,
    });

    await service.undo(await latestId());

    expect(store.get(7)?.name).toBe('Usunięta');
  });

  it('refuses to restore a delete when that id is taken again', async () => {
    store.set(7, { id: 7, name: 'Nowa grupa pod tym id', updatedAt: AT });
    await record({
      operation: 'delete',
      before: { id: 7, name: 'Usunięta', updatedAt: AT },
      after: null,
      entityId: 7,
    });

    await expect(service.undo(await latestId())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(store.get(7)?.name).toBe('Nowa grupa pod tym id');
  });

  it('removes the record again when undoing a create', async () => {
    store.set(1, { id: 1, name: 'Nowa', updatedAt: AT });
    await record({ operation: 'create', before: null });

    await service.undo(await latestId());

    expect(store.has(1)).toBe(false);
  });

  it('refuses a second undo of the same entry', async () => {
    store.set(1, { id: 1, name: 'Nowa', updatedAt: AT });
    await record();
    const id = await latestId();
    await service.undo(id);

    await expect(service.undo(id)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses to undo an entry recorded under an older schema version', async () => {
    store.set(1, { id: 1, name: 'Nowa', updatedAt: AT });
    await record();
    const id = await latestId();
    await dataSource
      .getRepository(ActionLog)
      .update(id, { schemaVersion: ACTION_LOG_SCHEMA_VERSION - 1 });

    await expect(service.undo(id)).rejects.toBeInstanceOf(BadRequestException);
    // ...but the entry is still listed, so the audit trail survives.
    const [entry] = await service.list();
    expect(entry.undoable).toBe(false);
    expect(entry.notUndoableReason).toMatch(/struktura bazy/i);
  });

  it('refuses when the record was deleted after the logged update', async () => {
    await record(); // store has no id 1

    await expect(service.undo(await latestId())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('lists newest first and marks what can still be undone', async () => {
    store.set(1, { id: 1, name: 'Nowa', updatedAt: AT });
    await record({ label: 'Pierwsza' });
    await record({ label: 'Druga' });

    const entries = await service.list();

    expect(entries[0].label).toBe('Druga');
    expect(entries[0].undoable).toBe(true);
  });
});
