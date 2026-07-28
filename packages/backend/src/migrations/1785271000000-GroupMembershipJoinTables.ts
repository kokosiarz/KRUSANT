import { MigrationInterface, QueryRunner } from 'typeorm';

// Converts Group.studentIds/classIds from JSON-array columns into real
// many-to-many join tables (group_students, group_classes), matching the
// @ManyToMany relations added to Group. Backfills from the JSON arrays
// before dropping the columns, so existing membership survives.
//
// Uses ALTER TABLE ADD/DROP COLUMN directly (SQLite 3.35+, confirmed
// available via better-sqlite3) rather than the usual TypeORM temp-table
// rebuild dance, specifically to avoid a DROP TABLE "group" step: TypeORM's
// own `migration:revert` starts its transaction before calling
// queryRunner.beforeMigration() (which sets `PRAGMA foreign_keys = OFF`),
// and that pragma is a no-op once a transaction is already open in SQLite —
// so foreign_keys stays ON during down(), and a DROP TABLE "group" would
// cascade-delete the very group_students/group_classes rows this migration
// depends on (verified empirically). Never dropping/recreating "group"
// itself sidesteps that footgun entirely.
export class GroupMembershipJoinTables1785271000000 implements MigrationInterface {
  name = 'GroupMembershipJoinTables1785271000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_students" ("groupId" integer NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_group_students_group" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_group_students_student" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("groupId", "studentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db9a438a218989ecaa69acc225" ON "group_students" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_673797eb80fe17fe53d74ae049" ON "group_students" ("studentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "group_classes" ("groupId" integer NOT NULL, "classId" integer NOT NULL, CONSTRAINT "FK_group_classes_group" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_group_classes_class" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("groupId", "classId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dc281fd481e917d41d10fecf1" ON "group_classes" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d25268c1ac367920697029617c" ON "group_classes" ("classId") `,
    );

    // Backfill from the JSON arrays while the columns still exist.
    await queryRunner.query(
      `INSERT INTO "group_students" ("groupId", "studentId") SELECT g."id", je.value FROM "group" g, json_each(g."studentIds") je WHERE je.value IS NOT NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "group_classes" ("groupId", "classId") SELECT g."id", je.value FROM "group" g, json_each(g."classIds") je WHERE je.value IS NOT NULL`,
    );

    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "studentIds"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "classIds"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" ADD COLUMN "studentIds" json NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD COLUMN "classIds" json NOT NULL DEFAULT '[]'`,
    );

    // Backfill the JSON arrays from the join tables before dropping them.
    await queryRunner.query(
      `UPDATE "group" SET "studentIds" = (SELECT json_group_array(gs."studentId") FROM "group_students" gs WHERE gs."groupId" = "group"."id") WHERE EXISTS (SELECT 1 FROM "group_students" gs WHERE gs."groupId" = "group"."id")`,
    );
    await queryRunner.query(
      `UPDATE "group" SET "classIds" = (SELECT json_group_array(gc."classId") FROM "group_classes" gc WHERE gc."groupId" = "group"."id") WHERE EXISTS (SELECT 1 FROM "group_classes" gc WHERE gc."groupId" = "group"."id")`,
    );

    await queryRunner.query(`DROP TABLE "group_classes"`);
    await queryRunner.query(`DROP TABLE "group_students"`);
  }
}
