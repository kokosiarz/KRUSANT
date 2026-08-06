import { summariseChanges, ChangeLookups } from './changeSummary';

const lookups: ChangeLookups = {
  teacherName: (id) => ({ 1: 'Anna Kowalska', 2: 'Piotr Nowak' })[id] ?? `Nauczyciel #${id}`,
  roomName: (id) => ({ 5: 'Pracownia A', 6: 'Pracownia B' })[id] ?? `Sala #${id}`,
  groupName: (id) => ({ 9: 'Srebro I' })[id] ?? `Grupa #${id}`,
  studentName: (id) => ({ 10: 'Jan Kot', 11: 'Ewa Nowak', 12: 'Maria Zoll' })[id] ?? `Kursant #${id}`,
  currency: 'PLN',
};

const row = (rows: ReturnType<typeof summariseChanges>, key: string) =>
  rows.find((r) => r.key === key);

describe('summariseChanges', () => {
  it('reports only the fields that actually moved', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { id: 1, cost: 100, comment: 'stary', updatedAt: '2026-01-01T10:00:00Z' },
        after: { id: 1, cost: 120, comment: 'stary', updatedAt: '2026-01-02T10:00:00Z' },
      },
      lookups
    );

    expect(rows.map((r) => r.key)).toEqual(['cost']);
    expect(row(rows, 'cost')).toMatchObject({ before: '100.00 PLN', after: '120.00 PLN' });
  });

  it('resolves ids to names, which is the whole point of the panel', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { teacherId: 1, roomId: 5, groupId: 9 },
        after: { teacherId: 2, roomId: 6, groupId: 9 },
      },
      lookups
    );

    expect(row(rows, 'teacherId')).toMatchObject({
      label: 'Nauczyciel',
      before: 'Anna Kowalska',
      after: 'Piotr Nowak',
    });
    expect(row(rows, 'roomId')).toMatchObject({ before: 'Pracownia A', after: 'Pracownia B' });
    // groupId didn't change, so it isn't listed at all.
    expect(row(rows, 'groupId')).toBeUndefined();
  });

  it('shows who joined or left a roster rather than both lists in full', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { attendedStudentsIds: [10, 11] },
        after: { attendedStudentsIds: [11, 12] },
      },
      lookups
    );

    expect(row(rows, 'attendedStudentsIds')).toMatchObject({
      label: 'Obecni',
      added: ['Maria Zoll'],
      removed: ['Jan Kot'],
    });
  });

  it('treats a reordered roster as unchanged', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { plannedStudentsIds: [10, 11, 12] },
        after: { plannedStudentsIds: [12, 10, 11] },
      },
      lookups
    );

    expect(rows).toEqual([]);
  });

  it('does not report a cost as changed just because it came back as a string', () => {
    const rows = summariseChanges(
      { operation: 'update', before: { cost: 120 }, after: { cost: '120' } },
      lookups
    );

    expect(rows).toEqual([]);
  });

  it('hides bookkeeping the user neither set nor can act on', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { id: 1, createdAt: 'a', updatedAt: 'b', classIds: [1], name: 'Stara' },
        after: { id: 1, createdAt: 'a', updatedAt: 'c', classIds: [1, 2], name: 'Nowa' },
      },
      lookups
    );

    expect(rows.map((r) => r.key)).toEqual(['name']);
  });

  it('lists what a created record was born with, and nothing empty', () => {
    const rows = summariseChanges(
      {
        operation: 'create',
        before: null,
        after: { id: 3, name: 'Srebro II', comment: '', teacherId: 1, isActive: true },
      },
      lookups
    );

    expect(rows.map((r) => r.key).sort()).toEqual(['isActive', 'name', 'teacherId']);
    expect(row(rows, 'name')).toMatchObject({ after: 'Srebro II' });
    expect(row(rows, 'name')?.before).toBeUndefined();
    expect(row(rows, 'isActive')).toMatchObject({ after: 'Tak' });
  });

  it('lists what a deleted record contained', () => {
    const rows = summariseChanges(
      {
        operation: 'delete',
        before: { id: 3, startTime: '2026-08-05T08:00:00.000Z', roomId: 5 },
        after: null,
      },
      lookups
    );

    expect(row(rows, 'roomId')).toMatchObject({ before: 'Pracownia A' });
    expect(row(rows, 'roomId')?.after).toBeUndefined();
    // Formatted for reading, not the raw ISO string.
    expect(row(rows, 'startTime')?.before).not.toContain('T08:00');
  });

  it('renders a missing value as a dash rather than "null"', () => {
    const rows = summariseChanges(
      { operation: 'update', before: { comment: null }, after: { comment: 'coś' } },
      lookups
    );

    expect(row(rows, 'comment')).toMatchObject({ before: '—', after: 'coś' });
  });

  it('formats partial dates the way the group form shows them', () => {
    const rows = summariseChanges(
      {
        operation: 'update',
        before: { minStartDate: null },
        after: { minStartDate: { day: 4, month: 9, year: 2026 } },
      },
      lookups
    );

    expect(row(rows, 'minStartDate')).toMatchObject({ after: '04.09.2026' });
  });

  it('says nothing changed rather than inventing rows', () => {
    const rows = summariseChanges(
      { operation: 'update', before: { name: 'A' }, after: { name: 'A' } },
      lookups
    );

    expect(rows).toEqual([]);
  });
});
