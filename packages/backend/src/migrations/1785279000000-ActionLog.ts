import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds `action_log`: who changed what, when, and enough state to reverse it.
//
// `before`/`after` are JSON snapshots of the API-level record shape, and
// `afterUpdatedAt` is the record's updatedAt right after the write — undo
// requires it to still match, so a stale undo can't clobber someone else's
// later edit. `schemaVersion` records which shape the snapshot was taken
// under; entries from an older shape stay readable but aren't undoable.
//
// Pure addition: no existing table is touched, so there is nothing to back up
// and down() simply drops it.
export class ActionLog1785279000000 implements MigrationInterface {
  name = 'ActionLog1785279000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "action_log" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "at" datetime NOT NULL DEFAULT (datetime('now')),
        "userId" integer,
        "userEmail" varchar,
        "entity" varchar NOT NULL,
        "entityId" integer NOT NULL,
        "operation" varchar NOT NULL,
        "label" varchar NOT NULL,
        "before" json,
        "after" json,
        "afterUpdatedAt" datetime,
        "schemaVersion" integer NOT NULL,
        "undoneAt" datetime,
        "undoneByUserId" integer
      )`,
    );
    // The history list is "most recent first", and undo looks entries up by
    // the record they touched.
    await queryRunner.query(
      `CREATE INDEX "IDX_action_log_at" ON "action_log" ("at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_action_log_entity" ON "action_log" ("entity", "entityId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_action_log_entity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_action_log_at"`);
    await queryRunner.query(`DROP TABLE "action_log"`);
  }
}
