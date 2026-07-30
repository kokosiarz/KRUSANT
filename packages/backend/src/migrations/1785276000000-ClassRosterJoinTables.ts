import { MigrationInterface, QueryRunner } from 'typeorm';

// Converts ClassEntity.attendedStudentsIds / plannedStudentsIds from JSON
// array columns into real join tables, finishing the job started on Group.
// Deleting a student now cleans up their attendance rows automatically
// instead of leaving an orphaned id embedded in every class forever, and the
// last json_each-style membership storage in the schema goes away.
//
// The API shape is unchanged: ClassesService maps the relations back to
// attendedStudentsIds/plannedStudentsIds, so no client needs to move.
//
// Backfill skips ids with no matching student — the JSON columns had no
// foreign keys, so they could (and did, historically) accumulate stale ids.
// Those would violate the new FK, so they are dropped rather than imported.
export class ClassRosterJoinTables1785276000000 implements MigrationInterface {
  name = 'ClassRosterJoinTables1785276000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column, source] of [
      ['class_attended_students', 'attendedStudentsIds', 'attended'],
      ['class_planned_students', 'plannedStudentsIds', 'planned'],
    ] as const) {
      await queryRunner.query(
        `CREATE TABLE "${table}" ("classId" integer NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_${table}_class" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_${table}_student" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("classId", "studentId"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_${source}_classId" ON "${table}" ("classId")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_${source}_studentId" ON "${table}" ("studentId")`,
      );
      await queryRunner.query(
        `INSERT OR IGNORE INTO "${table}" ("classId", "studentId")
         SELECT c."id", je.value FROM "class" c, json_each(c."${column}") je
         WHERE je.value IS NOT NULL
           AND EXISTS (SELECT 1 FROM "student" s WHERE s."id" = je.value)`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "class" DROP COLUMN "attendedStudentsIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class" DROP COLUMN "plannedStudentsIds"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class" ADD COLUMN "attendedStudentsIds" json NOT NULL DEFAULT ('[]')`,
    );
    await queryRunner.query(
      `ALTER TABLE "class" ADD COLUMN "plannedStudentsIds" json NOT NULL DEFAULT ('[]')`,
    );

    for (const [table, column] of [
      ['class_attended_students', 'attendedStudentsIds'],
      ['class_planned_students', 'plannedStudentsIds'],
    ] as const) {
      await queryRunner.query(
        `UPDATE "class" SET "${column}" = COALESCE(
           (SELECT json_group_array(j."studentId") FROM "${table}" j WHERE j."classId" = "class"."id"),
           '[]')`,
      );
      await queryRunner.query(`DROP TABLE "${table}"`);
    }
  }
}
