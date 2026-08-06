import api from '../client';

export interface HistoryEntry {
  id: number;
  at: string;
  userId: number | null;
  userEmail: string | null;
  entity: 'group' | 'class';
  entityId: number;
  operation: 'create' | 'update' | 'delete';
  label: string;
  /**
   * The record's API-level state either side of the write — what the history
   * page diffs to show what actually changed. Null on the side that doesn't
   * exist: `before` for a create, `after` for a delete.
   */
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  schemaVersion: number;
  undoneAt: string | null;
  /** False when the entry can't be reversed; `notUndoableReason` says why. */
  undoable: boolean;
  notUndoableReason: string | null;
}

export const historyApi = {
  getHistory: async (limit?: number): Promise<HistoryEntry[]> =>
    api.get<HistoryEntry[]>(`/history${limit ? `?limit=${limit}` : ''}`),

  /**
   * Reverses one recorded action. Fails with 409 if the record has changed
   * since — the server refuses rather than overwriting someone else's edit.
   */
  undo: async (id: number): Promise<{ message: string }> =>
    api.post<{ message: string }>(`/history/${id}/undo`),
};
