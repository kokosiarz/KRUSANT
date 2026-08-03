import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds real FK constraints to the previously-unconstrained integer link
// columns: Group.teacherId/roomId, Class.groupId/roomId/teacherId,
// Payment.studentId, Debit.studentId/classId. Deliberately does NOT touch
// entity metadata/decorators — every entity keeps its plain `@Column()`
// exactly as-is, so no DTO/service/frontend code needs to change. Confirmed
// via a pre-migration orphan check against production data that every one of
// these columns is already clean (no dangling ids), so the constraint can be
// added without any data cleanup.
//
// onDelete choices: required/financial links (Group.teacherId, Payment/Debit
// .studentId) use RESTRICT so deleting a Teacher/Student with live
// Groups/financial history fails loudly instead of orphaning records —
// BaseCrudService.remove() translates the resulting constraint violation
// into a friendly ConflictException. Optional/informational links (roomId,
// groupId, teacherId on Class, Debit.classId) use SET NULL.
//
// `group` and `class` already have cascade-referencing children from the
// earlier migration (group_students/group_classes -> group;
// group_classes/student_classes_class -> class). Rebuilding a parent table
// fires an implicit DELETE that cascades to those children. Safe during
// up() (TypeORM disables `foreign_keys` before starting the transaction for
// `migration:run`), but NOT during `migration:revert` (its transaction
// starts before that pragma call, which is then a no-op inside an open
// transaction, per SQLite semantics) - documented footgun from the previous
// migration. down() backs up those three junction tables before touching
// group/class and restores them afterward.
export class LooseForeignKeyConstraints1785272000000 implements MigrationInterface {
  name = 'LooseForeignKeyConstraints1785272000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // group: teacherId RESTRICT, roomId SET NULL
    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "numberOfHours" integer, CONSTRAINT "FK_group_teacherId" FOREIGN KEY ("teacherId") REFERENCES "teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_group_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"("id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours") SELECT "id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours" FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    // class: groupId/roomId/teacherId all SET NULL
    await queryRunner.query(
      `CREATE TABLE "temporary_class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "groupId" integer, "startTime" varchar NOT NULL, "roomId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "lessonLength" varchar NOT NULL, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), CONSTRAINT "FK_class_groupId" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_class_teacherId" FOREIGN KEY ("teacherId") REFERENCES "teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_class"("id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds") SELECT "id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds" FROM "class"`,
    );
    await queryRunner.query(`DROP TABLE "class"`);
    await queryRunner.query(`ALTER TABLE "temporary_class" RENAME TO "class"`);

    // payment: studentId RESTRICT
    await queryRunner.query(
      `CREATE TABLE "temporary_payment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" date NOT NULL, "amount" decimal(10,2) NOT NULL, "comment" text, "studentId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "proofType" text NOT NULL, "fiscalized" boolean NOT NULL DEFAULT (0), "invoiceId" integer, CONSTRAINT "FK_payment_studentId" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_payment"("id", "date", "amount", "comment", "studentId", "createdAt", "updatedAt", "proofType", "fiscalized", "invoiceId") SELECT "id", "date", "amount", "comment", "studentId", "createdAt", "updatedAt", "proofType", "fiscalized", "invoiceId" FROM "payment"`,
    );
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_payment" RENAME TO "payment"`,
    );

    // debits: studentId RESTRICT, classId SET NULL
    await queryRunner.query(
      `CREATE TABLE "temporary_debits" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dueDate" date NOT NULL, "amount" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "comment" text, "studentId" integer NOT NULL, "entitlement" text, "classId" integer, CONSTRAINT "FK_debits_studentId" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "FK_debits_classId" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_debits"("id", "dueDate", "amount", "createdAt", "updatedAt", "comment", "studentId", "entitlement", "classId") SELECT "id", "dueDate", "amount", "createdAt", "updatedAt", "comment", "studentId", "entitlement", "classId" FROM "debits"`,
    );
    await queryRunner.query(`DROP TABLE "debits"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_debits" RENAME TO "debits"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Back up the junction tables that cascade off group/class before we
    // rebuild either of those two tables (see class-level comment above).
    await queryRunner.query(
      `CREATE TABLE "_fk_backup_group_students" AS SELECT * FROM "group_students"`,
    );
    await queryRunner.query(
      `CREATE TABLE "_fk_backup_group_classes" AS SELECT * FROM "group_classes"`,
    );
    await queryRunner.query(
      `CREATE TABLE "_fk_backup_student_classes_class" AS SELECT * FROM "student_classes_class"`,
    );

    // group: drop the constraints, back to a plain column
    await queryRunner.query(
      `CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "comment" text NOT NULL DEFAULT (''), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "minStartDate" json, "maxEndDate" json, "colorHex" text, "startHour" time, "lessonLength" time, "roomId" integer, "numberOfHours" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group"("id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours") SELECT "id", "name", "isActive", "cost", "unitCost", "comment", "createdAt", "teacherId", "updatedAt", "minStartDate", "maxEndDate", "colorHex", "startHour", "lessonLength", "roomId", "numberOfHours" FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);

    // class: drop the constraints
    await queryRunner.query(
      `CREATE TABLE "temporary_class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "groupId" integer, "startTime" varchar NOT NULL, "roomId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "lessonLength" varchar NOT NULL, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_class"("id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds") SELECT "id", "groupId", "startTime", "roomId", "createdAt", "updatedAt", "teacherId", "cost", "comment", "lessonLength", "attendedStudentsIds", "plannedStudentsIds" FROM "class"`,
    );
    await queryRunner.query(`DROP TABLE "class"`);
    await queryRunner.query(`ALTER TABLE "temporary_class" RENAME TO "class"`);

    // payment: drop the constraint
    await queryRunner.query(
      `CREATE TABLE "temporary_payment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" date NOT NULL, "amount" decimal(10,2) NOT NULL, "comment" text, "studentId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "proofType" text NOT NULL, "fiscalized" boolean NOT NULL DEFAULT (0), "invoiceId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_payment"("id", "date", "amount", "comment", "studentId", "createdAt", "updatedAt", "proofType", "fiscalized", "invoiceId") SELECT "id", "date", "amount", "comment", "studentId", "createdAt", "updatedAt", "proofType", "fiscalized", "invoiceId" FROM "payment"`,
    );
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_payment" RENAME TO "payment"`,
    );

    // debits: drop the constraints
    await queryRunner.query(
      `CREATE TABLE "temporary_debits" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dueDate" date NOT NULL, "amount" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "comment" text, "studentId" integer NOT NULL, "entitlement" text, "classId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_debits"("id", "dueDate", "amount", "createdAt", "updatedAt", "comment", "studentId", "entitlement", "classId") SELECT "id", "dueDate", "amount", "createdAt", "updatedAt", "comment", "studentId", "entitlement", "classId" FROM "debits"`,
    );
    await queryRunner.query(`DROP TABLE "debits"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_debits" RENAME TO "debits"`,
    );

    // Restore the junction tables cascade-wiped by the group/class rebuilds above.
    await queryRunner.query(
      `INSERT INTO "group_students" SELECT * FROM "_fk_backup_group_students"`,
    );
    await queryRunner.query(
      `INSERT INTO "group_classes" SELECT * FROM "_fk_backup_group_classes"`,
    );
    await queryRunner.query(
      `INSERT INTO "student_classes_class" SELECT * FROM "_fk_backup_student_classes_class"`,
    );
    await queryRunner.query(`DROP TABLE "_fk_backup_group_students"`);
    await queryRunner.query(`DROP TABLE "_fk_backup_group_classes"`);
    await queryRunner.query(`DROP TABLE "_fk_backup_student_classes_class"`);
  }
}
