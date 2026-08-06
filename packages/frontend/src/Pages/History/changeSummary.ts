import type { HistoryEntry } from '@api/endpoints/history';

/**
 * One field's worth of change, already rendered to display strings.
 *
 * Names are resolved here rather than in the component because the snapshots
 * store ids: an entry saying "teacherId 4 -> 7" is a puzzle, "Anna Kowalska ->
 * Piotr Nowak" is an answer. The lookups are passed in so this stays a pure
 * function and can be tested without React Query.
 */
export interface ChangeRow {
  key: string;
  label: string;
  /** Absent for a create — there was no previous value. */
  before?: string;
  /** Absent for a delete — there is no new value. */
  after?: string;
  /** For roster fields, who actually joined or left. */
  added?: string[];
  removed?: string[];
}

export interface ChangeLookups {
  teacherName: (id: number) => string;
  roomName: (id: number) => string;
  groupName: (id: number) => string;
  studentName: (id: number) => string;
  currency: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nazwa',
  startTime: 'Termin',
  lessonLength: 'Długość zajęć',
  startHour: 'Godzina rozpoczęcia',
  cost: 'Koszt',
  unitCost: 'Koszt jednostkowy (h)',
  numberOfHours: 'Liczba godzin',
  comment: 'Komentarz',
  teacherId: 'Nauczyciel',
  roomId: 'Sala',
  groupId: 'Grupa',
  courseId: 'Kurs',
  colorHex: 'Kolor',
  isActive: 'Aktywna',
  isTemplate: 'Szablon',
  minStartDate: 'Min. data startu',
  maxEndDate: 'Max. data końca',
  studentIds: 'Kursanci',
  plannedStudentsIds: 'Kursanci (planowani)',
  attendedStudentsIds: 'Obecni',
  absentStudentsIds: 'Nieobecni',
  rescheduledStudentsIds: 'Przełożone',
};

/**
 * Bookkeeping the user didn't do and can't act on. `classIds` is derived from
 * `class.groupId` rather than written through the group, so showing it as a
 * change of the group would be a lie about what happened.
 */
const HIDDEN_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'classIds']);

const STUDENT_LIST_FIELDS = new Set([
  'studentIds',
  'plannedStudentsIds',
  'attendedStudentsIds',
  'absentStudentsIds',
  'rescheduledStudentsIds',
]);

const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const isBlank = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/** Compares by meaning, not representation: "120" and 120 are the same cost. */
function sameValue(a: unknown, b: unknown): boolean {
  if (isBlank(a) && isBlank(b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    const left = [...((a as number[]) ?? [])].sort();
    const right = [...((b as number[]) ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
  }
  if (typeof a === 'object' || typeof b === 'object') {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;
  }
  return String(a ?? '') === String(b ?? '');
}

function formatPartialDate(value: unknown): string {
  const d = value as { day?: number; month?: number; year?: number } | null;
  if (!d || d.day == null || d.month == null) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.day)}.${pad(d.month)}${d.year ? `.${d.year}` : ''}`;
}

function formatValue(key: string, value: unknown, lookups: ChangeLookups): string {
  if (isBlank(value)) return '—';

  switch (key) {
    case 'startTime': {
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? String(value) : dateTimeFormat.format(date);
    }
    case 'cost':
    case 'unitCost': {
      const n = Number(value);
      return Number.isNaN(n) ? String(value) : `${n.toFixed(2)} ${lookups.currency}`;
    }
    case 'teacherId':
      return lookups.teacherName(Number(value));
    case 'roomId':
      return lookups.roomName(Number(value));
    case 'groupId':
      return lookups.groupName(Number(value));
    case 'isActive':
    case 'isTemplate':
      return value ? 'Tak' : 'Nie';
    case 'minStartDate':
    case 'maxEndDate':
      return formatPartialDate(value);
    default:
      break;
  }

  if (STUDENT_LIST_FIELDS.has(key) && Array.isArray(value)) {
    return value.map((id) => lookups.studentName(Number(id))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

function rosterDelta(
  before: unknown,
  after: unknown,
  lookups: ChangeLookups
): { added: string[]; removed: string[] } {
  const b = new Set((before as number[]) ?? []);
  const a = new Set((after as number[]) ?? []);
  return {
    added: [...a].filter((id) => !b.has(id)).map((id) => lookups.studentName(id)),
    removed: [...b].filter((id) => !a.has(id)).map((id) => lookups.studentName(id)),
  };
}

/**
 * Turns a log entry's stored snapshots into the list of changes to show.
 *
 * A create lists what the record was born with, a delete what was lost, and an
 * update only the fields that actually moved — an update whose snapshots differ
 * by nothing but `updatedAt` produces an empty list rather than a wall of
 * unchanged values.
 */
export function summariseChanges(
  entry: Pick<HistoryEntry, 'operation' | 'before' | 'after'>,
  lookups: ChangeLookups
): ChangeRow[] {
  const before = entry.before ?? {};
  const after = entry.after ?? {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => !HIDDEN_FIELDS.has(key))
    .sort((a, b) => labelFor(a).localeCompare(labelFor(b), 'pl'));

  const rows: ChangeRow[] = [];

  for (const key of keys) {
    const beforeValue = before[key];
    const afterValue = after[key];

    if (entry.operation === 'create') {
      if (isBlank(afterValue)) continue;
      rows.push({ key, label: labelFor(key), after: formatValue(key, afterValue, lookups) });
      continue;
    }
    if (entry.operation === 'delete') {
      if (isBlank(beforeValue)) continue;
      rows.push({ key, label: labelFor(key), before: formatValue(key, beforeValue, lookups) });
      continue;
    }

    if (sameValue(beforeValue, afterValue)) continue;

    if (STUDENT_LIST_FIELDS.has(key)) {
      // Listing both rosters in full makes the reader diff ten names by eye.
      const { added, removed } = rosterDelta(beforeValue, afterValue, lookups);
      rows.push({ key, label: labelFor(key), added, removed });
      continue;
    }

    rows.push({
      key,
      label: labelFor(key),
      before: formatValue(key, beforeValue, lookups),
      after: formatValue(key, afterValue, lookups),
    });
  }

  return rows;
}
