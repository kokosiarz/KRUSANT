import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomBytes } from 'crypto';

// Removes the `teacher` table entirely: a teacher is now simply a user holding
// the 'teacher' role. `Teacher` only ever held {id, name, email} — a strict
// subset of `user` — and keeping the two in sync by hand had already drifted in
// production (a user with the teacher role but no profile; a profile whose
// login was never linked), silently breaking the "my students" filter and
// display names.
//
// group.teacherId / class.teacherId / group_template.teacherId are repointed
// from teacher ids to user ids, and user.name is introduced (backfilled from
// teacher.name) so the app still has a display name to show.
//
// Teacher -> user resolution is deliberately generic rather than hardcoded to
// production ids, so this also works on dev/fresh databases:
//   1. an existing user.teacherId link
//   2. exact (case-insensitive) email match
//   3. dot-stripped email match — Gmail treats a.b@ and ab@ as one mailbox,
//      and that is exactly how the real teacher/login pair had diverged
//   4. otherwise create a user from the teacher's email/name, with an
//      unusable random passwordHash (correct `salt.hash` shape, so
//      verifyPassword just returns false rather than throwing)
//
// As in the previous migration: rebuilding `group`/`class` fires implicit
// cascading DELETEs into group_students / group_classes /
// student_classes_class. That is safe in up() (TypeORM disables foreign_keys
// before the migration:run transaction) but NOT in down(), whose transaction
// opens before that pragma — so down() backs those three tables up and
// restores them.
export class MergeTeacherIntoUser1785273000000 implements MigrationInterface {
  name = 'MergeTeacherIntoUser1785273000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "name" varchar`);

    const teachers: { id: number; name: string; email: string }[] =
      await queryRunner.query(`SELECT "id", "name", "email" FROM "teacher"`);
    const users: {
      id: number;
      email: string;
      teacherId: number | null;
    }[] = await queryRunner.query(
      `SELECT "id", "email", "teacherId" FROM "user"`,
    );

    const normalise = (email: string) => {
      const [local, domain] = (email ?? '').toLowerCase().split('@');
      return `${(local ?? '').replace(/\./g, '')}@${domain ?? ''}`;
    };

    // teacher.id -> user.id
    const teacherToUser = new Map<number, number>();

    for (const teacher of teachers) {
      const linked = users.find((u) => u.teacherId === teacher.id);
      const exact = users.find(
        (u) => u.email?.toLowerCase() === teacher.email?.toLowerCase(),
      );
      const normalised = users.find(
        (u) => normalise(u.email) === normalise(teacher.email),
      );
      let match = linked ?? exact ?? normalised;

      if (!match) {
        // No login for this teacher — create one so their groups/classes keep
        // a valid owner. Password is unusable by construction.
        const passwordHash = `${randomBytes(16).toString('hex')}.${randomBytes(32).toString('hex')}`;
        await queryRunner.query(
          `INSERT INTO "user" ("email", "name", "passwordHash", "roles", "studentId") VALUES (?, ?, ?, 'teacher', NULL)`,
          [teacher.email, teacher.name, passwordHash],
        );
        const [created]: { id: number }[] = await queryRunner.query(
          `SELECT "id" FROM "user" WHERE "email" = ? LIMIT 1`,
          [teacher.email],
        );
        match = { id: created.id, email: teacher.email, teacherId: null };
        users.push(match);
      }

      teacherToUser.set(teacher.id, match.id);

      // Carry the teacher's display name onto the surviving user, and make
      // sure they actually hold the teacher role now that the role is the
      // only thing marking someone as a teacher.
      await queryRunner.query(
        `UPDATE "user" SET "name" = COALESCE("name", ?) WHERE "id" = ?`,
        [teacher.name, match.id],
      );
      await queryRunner.query(
        `UPDATE "user" SET "roles" = CASE
           WHEN "roles" IS NULL OR "roles" = '' THEN 'teacher'
           WHEN ',' || "roles" || ',' LIKE '%,teacher,%' THEN "roles"
           ELSE "roles" || ',teacher' END
         WHERE "id" = ?`,
        [match.id],
      );
    }

    // Repoint the FK columns from teacher ids to user ids. This must happen in
    // ONE pass per table via a mapping table: applying the pairs sequentially
    // would double-remap whenever one teacher's id equals another teacher's
    // target user id (rows rewritten by an earlier pair get caught by a later
    // one). A subquery reads the original value, so every row moves exactly once.
    await queryRunner.query(
      `CREATE TEMPORARY TABLE "_teacher_map" ("teacherId" integer PRIMARY KEY, "userId" integer NOT NULL)`,
    );
    for (const [teacherId, userId] of teacherToUser) {
      await queryRunner.query(
        `INSERT INTO "_teacher_map" ("teacherId", "userId") VALUES (?, ?)`,
        [teacherId, userId],
      );
    }
    for (const table of ['group', 'class', 'group_template']) {
      await queryRunner.query(
        `UPDATE "${table}" SET "teacherId" = (SELECT m."userId" FROM "_teacher_map" m WHERE m."teacherId" = "${table}"."teacherId")
         WHERE "teacherId" IN (SELECT "teacherId" FROM "_teacher_map")`,
      );
    }
    await queryRunner.query(`DROP TABLE "_teacher_map"`);

    // group.teacherId is NOT NULL with ON DELETE RESTRICT — an unresolved row
    // would corrupt the table, so fail loudly rather than continue.
    const [{ orphans }]: { orphans: number }[] = await queryRunner.query(
      `SELECT COUNT(*) AS orphans FROM "group" g WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = g."teacherId")`,
    );
    if (Number(orphans) > 0) {
      throw new Error(
        `MergeTeacherIntoUser: ${orphans} group row(s) still reference a teacher id with no matching user. Aborting.`,
      );
    }
    // class.teacherId is nullable — null out anything unresolved instead.
    await queryRunner.query(
      `UPDATE "class" SET "teacherId" = NULL WHERE "teacherId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = "class"."teacherId")`,
    );
    await queryRunner.query(
      `UPDATE "group_template" SET "teacherId" = NULL WHERE "teacherId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = "group_template"."teacherId")`,
    );

    // Rebuild group/class so their teacherId FKs target "user" instead of
    // "teacher". Same column order as the previous migration produced.
    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "numberOfHours" integer, CONSTRAINT "FK_group_teacherId" FOREIGN KEY ("teacherId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_group_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"("id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours") SELECT "id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours" FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    await queryRunner.query(
      `CREATE TABLE "temporary_class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "groupId" integer, "startTime" varchar NOT NULL, "roomId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "lessonLength" varchar NOT NULL, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), CONSTRAINT "FK_class_groupId" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_teacherId" FOREIGN KEY ("teacherId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_class"("id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds") SELECT "id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds" FROM "class"`,
    );
    await queryRunner.query(`DROP TABLE "class"`);
    await queryRunner.query(`ALTER TABLE "temporary_class" RENAME TO "class"`);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "teacherId"`);
    await queryRunner.query(`DROP TABLE "teacher"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // `PRAGMA foreign_keys = OFF` is a no-op inside an already-open
    // transaction, which is exactly the situation migration:revert puts us in.
    // `defer_foreign_keys` is the pragma that *does* work there: it postpones
    // constraint checking to COMMIT, letting us remap teacherId values and
    // rebuild the tables in either order as long as the end state is
    // consistent. It does NOT suppress ON DELETE CASCADE actions, so the
    // junction-table backup/restore below is still required.
    await queryRunner.query(`PRAGMA defer_foreign_keys = ON`);

    // Recreate the teacher table from users holding the teacher role. Ids will
    // differ from the originals, so group/class/template are remapped to the
    // new ids below.
    await queryRunner.query(
      `CREATE TABLE "teacher" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "teacherId" integer`,
    );

    const teacherUsers: { id: number; email: string; name: string | null }[] =
      await queryRunner.query(
        `SELECT "id", "email", "name" FROM "user" WHERE ',' || COALESCE("roles", '') || ',' LIKE '%,teacher,%'`,
      );

    const userToTeacher = new Map<number, number>();
    for (const user of teacherUsers) {
      await queryRunner.query(
        `INSERT INTO "teacher" ("name", "email") VALUES (?, ?)`,
        [user.name ?? user.email, user.email],
      );
      const [created]: { id: number }[] = await queryRunner.query(
        `SELECT "id" FROM "teacher" WHERE "email" = ? ORDER BY "id" DESC LIMIT 1`,
        [user.email],
      );
      userToTeacher.set(user.id, created.id);
      await queryRunner.query(
        `UPDATE "user" SET "teacherId" = ? WHERE "id" = ?`,
        [created.id, user.id],
      );
    }

    // Back up the junction tables that cascade off group/class before either
    // is rebuilt (see class-level comment).
    await queryRunner.query(
      `CREATE TABLE "_mt_backup_group_students" AS SELECT * FROM "group_students"`,
    );
    await queryRunner.query(
      `CREATE TABLE "_mt_backup_group_classes" AS SELECT * FROM "group_classes"`,
    );
    await queryRunner.query(
      `CREATE TABLE "_mt_backup_student_classes_class" AS SELECT * FROM "student_classes_class"`,
    );

    // Single-pass remap via a mapping table, for the same collision reason as up().
    await queryRunner.query(
      `CREATE TEMPORARY TABLE "_user_map" ("userId" integer PRIMARY KEY, "teacherId" integer NOT NULL)`,
    );
    for (const [userId, teacherId] of userToTeacher) {
      await queryRunner.query(
        `INSERT INTO "_user_map" ("userId", "teacherId") VALUES (?, ?)`,
        [userId, teacherId],
      );
    }
    for (const table of ['group', 'class', 'group_template']) {
      await queryRunner.query(
        `UPDATE "${table}" SET "teacherId" = (SELECT m."teacherId" FROM "_user_map" m WHERE m."userId" = "${table}"."teacherId")
         WHERE "teacherId" IN (SELECT "userId" FROM "_user_map")`,
      );
    }
    await queryRunner.query(`DROP TABLE "_user_map"`);

    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "numberOfHours" integer, CONSTRAINT "FK_group_teacherId" FOREIGN KEY ("teacherId") REFERENCES "teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_group_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"("id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours") SELECT "id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours" FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    await queryRunner.query(
      `CREATE TABLE "temporary_class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "groupId" integer, "startTime" varchar NOT NULL, "roomId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "lessonLength" varchar NOT NULL, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), CONSTRAINT "FK_class_groupId" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_teacherId" FOREIGN KEY ("teacherId") REFERENCES "teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_class"("id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds") SELECT "id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds" FROM "class"`,
    );
    await queryRunner.query(`DROP TABLE "class"`);
    await queryRunner.query(`ALTER TABLE "temporary_class" RENAME TO "class"`);

    // Restore the junction tables cascade-wiped by the rebuilds above.
    await queryRunner.query(
      `INSERT INTO "group_students" SELECT * FROM "_mt_backup_group_students"`,
    );
    await queryRunner.query(
      `INSERT INTO "group_classes" SELECT * FROM "_mt_backup_group_classes"`,
    );
    await queryRunner.query(
      `INSERT INTO "student_classes_class" SELECT * FROM "_mt_backup_student_classes_class"`,
    );
    await queryRunner.query(`DROP TABLE "_mt_backup_group_students"`);
    await queryRunner.query(`DROP TABLE "_mt_backup_group_classes"`);
    await queryRunner.query(`DROP TABLE "_mt_backup_student_classes_class"`);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
  }
}
