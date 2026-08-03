import { MigrationInterface, QueryRunner } from 'typeorm';

// Folds `group_template` into `group` behind an `isTemplate` flag. The two
// tables carried an identical column set (templateName vs name, plus
// courseId), so every schema or behaviour change had to be made twice — and
// they had already drifted: `group`'s membership became real join tables while
// `group_template` still kept studentIds/classIds as JSON arrays.
//
// Shape changes to `group`:
//   - `isTemplate` boolean NOT NULL DEFAULT 0
//   - `courseId` integer NULL (templates persist which course they derive
//     from; previously CreateGroupDto.courseId was transient and discarded)
//   - `teacherId` becomes nullable, because a template can legitimately have
//     no teacher yet (the live template row has none). A CHECK constraint
//     keeps it required for real groups, so nothing is lost for actual groups.
//
// Template rows are inserted with fresh ids rather than their originals:
// nothing references group_template.id (Group.baseTemplateName is a name
// string, not a foreign key), so this sidesteps any id collision with
// existing groups. Their JSON studentIds/classIds are migrated into the
// group_students / group_classes join tables on the way in.
//
// Rebuilding `group` cascades into group_students/group_classes. up() is safe
// (migration:run disables foreign_keys before opening its transaction), but
// migration:revert's transaction opens first, making that pragma a no-op —
// so down() uses `defer_foreign_keys` and backs the junction tables up.
export class MergeGroupTemplateIntoGroup1785275000000 implements MigrationInterface {
  name = 'MergeGroupTemplateIntoGroup1785275000000';

  private static readonly GROUP_COLUMNS =
    '"id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours"';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cols = MergeGroupTemplateIntoGroup1785275000000.GROUP_COLUMNS;

    // Rebuild `group`: teacherId nullable + CHECK, new isTemplate/courseId.
    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "isTemplate" boolean NOT NULL DEFAULT (0), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "courseId" integer, "numberOfHours" integer, CONSTRAINT "FK_group_teacherId" FOREIGN KEY ("teacherId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_group_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_group_courseId" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "CHK_group_teacher_required" CHECK ("isTemplate" = 1 OR "teacherId" IS NOT NULL))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"(${cols}) SELECT ${cols} FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    // Carry each template across, remembering old id -> new id so its
    // membership arrays can be migrated into the join tables.
    const templates: { id: number }[] = await queryRunner.query(
      `SELECT "id" FROM "group_template"`,
    );
    for (const { id } of templates) {
      await queryRunner.query(
        `INSERT INTO "group" ("name", "isActive", "isTemplate", "cost", "unitCost", "comment", "createdAt", "updatedAt", "teacherId", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "courseId", "numberOfHours")
         SELECT "templateName", COALESCE("isActive", 1), 1, COALESCE("cost", 0), COALESCE("unitCost", 0), COALESCE("comment", ''), "createdAt", "updatedAt", "teacherId", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "courseId", "numberOfHours"
         FROM "group_template" WHERE "id" = ?`,
        [id],
      );
      const [{ newId }]: { newId: number }[] = await queryRunner.query(
        `SELECT last_insert_rowid() AS newId`,
      );
      // JSON arrays -> join tables. Guard against ids that no longer exist:
      // the old table had no foreign keys, so it could hold stale references.
      await queryRunner.query(
        `INSERT OR IGNORE INTO "group_students" ("groupId", "studentId")
         SELECT ?, je.value FROM "group_template" gt, json_each(gt."studentIds") je
         WHERE gt."id" = ? AND je.value IS NOT NULL
           AND EXISTS (SELECT 1 FROM "student" s WHERE s."id" = je.value)`,
        [newId, id],
      );
      await queryRunner.query(
        `INSERT OR IGNORE INTO "group_classes" ("groupId", "classId")
         SELECT ?, je.value FROM "group_template" gt, json_each(gt."classIds") je
         WHERE gt."id" = ? AND je.value IS NOT NULL
           AND EXISTS (SELECT 1 FROM "class" c WHERE c."id" = je.value)`,
        [newId, id],
      );
    }

    await queryRunner.query(`DROP TABLE "group_template"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // See class comment: foreign_keys=OFF is a no-op inside revert's open
    // transaction; defer_foreign_keys is not.
    await queryRunner.query(`PRAGMA defer_foreign_keys = ON`);

    const cols = MergeGroupTemplateIntoGroup1785275000000.GROUP_COLUMNS;

    await queryRunner.query(
      `CREATE TABLE "group_template" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "templateName" varchar NOT NULL, "isActive" boolean DEFAULT (1), "studentIds" json, "classIds" json, "teacherId" integer, "cost" decimal(10,2), "unitCost" decimal(10,2), "comment" text, "minStartDate" json, "maxEndDate" json, "colorHex" text, "numberOfHours" integer, "startHour" time, "lessonLength" time, "roomId" integer, "courseId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "group_template" ("templateName", "isActive", "studentIds", "classIds", "teacherId", "cost", "unitCost", "comment", "minStartDate", "maxEndDate", "colorHex", "numberOfHours", "startHour", "lessonLength", "roomId", "courseId", "createdAt", "updatedAt")
       SELECT g."name", g."isActive",
         COALESCE((SELECT json_group_array(gs."studentId") FROM "group_students" gs WHERE gs."groupId" = g."id"), '[]'),
         COALESCE((SELECT json_group_array(gc."classId") FROM "group_classes" gc WHERE gc."groupId" = g."id"), '[]'),
         g."teacherId", g."cost", g."unitCost", g."comment", g."minStartDate", g."maxEndDate", g."colorHex", g."numberOfHours", g."startHour", g."lessonLength", g."roomId", g."courseId", g."createdAt", g."updatedAt"
       FROM "group" g WHERE g."isTemplate" = 1`,
    );

    // Junction rows for templates disappear with the template rows themselves.
    await queryRunner.query(
      `DELETE FROM "group_students" WHERE "groupId" IN (SELECT "id" FROM "group" WHERE "isTemplate" = 1)`,
    );
    await queryRunner.query(
      `DELETE FROM "group_classes" WHERE "groupId" IN (SELECT "id" FROM "group" WHERE "isTemplate" = 1)`,
    );
    await queryRunner.query(`DELETE FROM "group" WHERE "isTemplate" = 1`);

    // Back up what cascades off `group` before rebuilding it.
    await queryRunner.query(
      `CREATE TABLE "_gt_backup_group_students" AS SELECT * FROM "group_students"`,
    );
    await queryRunner.query(
      `CREATE TABLE "_gt_backup_group_classes" AS SELECT * FROM "group_classes"`,
    );

    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "numberOfHours" integer, CONSTRAINT "FK_group_teacherId" FOREIGN KEY ("teacherId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_group_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"(${cols}) SELECT ${cols} FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    await queryRunner.query(
      `INSERT INTO "group_students" SELECT * FROM "_gt_backup_group_students"`,
    );
    await queryRunner.query(
      `INSERT INTO "group_classes" SELECT * FROM "_gt_backup_group_classes"`,
    );
    await queryRunner.query(`DROP TABLE "_gt_backup_group_students"`);
    await queryRunner.query(`DROP TABLE "_gt_backup_group_classes"`);
  }
}
