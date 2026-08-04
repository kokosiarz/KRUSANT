import { MigrationInterface, QueryRunner } from 'typeorm';

// Drops `group_classes`, the junction table behind Group.classes.
//
// A class happens once, in one room, with one teacher, for one group — that's
// one-to-many, and `class.groupId` (a real FK, ON DELETE SET NULL) already
// says so. A junction table additionally permits a class to belong to two
// groups, which is meaningless here.
//
// It was also never populated. Its only writer was GroupsService.syncMembership,
// fed by the group payload's `classIds`, which the wizard initialises to `[]`
// and nothing ever fills; classes are created separately from the Classes page
// with `groupId` set. The pre-migration `group.classIds` JSON column had the
// same problem, so GroupMembershipJoinTables backfilled this table with
// nothing — 0 rows in production, versus 7 for group_students, whose array
// *was* maintained.
//
// Consequence being fixed alongside this: GroupsService derived its response's
// `classIds` from this empty relation, so the API reported every group as
// having no classes. It now reads `class.groupId`.
//
// No data moves. The table is empty, so down() recreates it empty and the
// round trip is lossless.
export class DropGroupClassesJoinTable1785278000000 implements MigrationInterface {
  name = 'DropGroupClassesJoinTable1785278000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Guard rather than assume: if a future environment somehow has rows here,
    // fail loudly instead of silently discarding them.
    const rows = (await queryRunner.query(
      `SELECT COUNT(*) AS count FROM "group_classes"`,
    )) as { count: number }[];
    const count = Number(rows[0]?.count ?? 0);
    if (count > 0) {
      throw new Error(
        `group_classes holds ${count} row(s); this migration assumes it is empty. ` +
          'Reconcile them into class.groupId before dropping the table.',
      );
    }

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_7dc281fd481e917d41d10fecf1"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_d25268c1ac367920697029617c"`,
    );
    await queryRunner.query(`DROP TABLE "group_classes"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_classes" ("groupId" integer NOT NULL, "classId" integer NOT NULL, CONSTRAINT "FK_group_classes_group" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_group_classes_class" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("groupId", "classId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dc281fd481e917d41d10fecf1" ON "group_classes" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d25268c1ac367920697029617c" ON "group_classes" ("classId") `,
    );
  }
}
