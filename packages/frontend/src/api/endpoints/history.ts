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
