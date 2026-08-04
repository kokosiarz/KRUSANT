/**
 * Bump this whenever a migration changes the shape of `class` or `group`.
 *
 * Undo works by writing a stored JSON snapshot back into the table it came
 * from. If the table's columns have changed since, that snapshot no longer
 * describes a valid row — so entries recorded under an older version keep their
 * place in the log (the audit trail is the point) but their undo button is
 * disabled with a reason, rather than failing at the moment someone presses it.
 */
export const ACTION_LOG_SCHEMA_VERSION = 1;

/** Entities whose writes are recorded. */
export type LoggedEntity = 'group' | 'class';

export type LoggedOperation = 'create' | 'update' | 'delete';

/** How many entries the history endpoint returns by default. */
export const ACTION_LOG_PAGE_SIZE = 100;
