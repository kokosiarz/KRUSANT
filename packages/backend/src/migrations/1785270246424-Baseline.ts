import { MigrationInterface, QueryRunner } from "typeorm";

// Baseline migration: creates every table from scratch, matching the schema
// `synchronize: true` had already been maintaining live.
//
// - Fresh environment (no db.sqlite yet): run `npm run migration:run` as normal;
//   `up()` creates everything.
// - An existing db.sqlite that was already kept in sync by `synchronize: true`
//   (production, or any populated local dev db): do NOT run `up()` — the tables
//   already exist. Instead mark this migration as applied without executing it:
//     INSERT INTO migrations (timestamp, name) VALUES (1785270246424, 'Baseline1785270246424');
//   (verified via a diff-check against a copy of the production db: the only
//   difference found was column ordering on `class`/`group` from historical
//   incremental ALTERs, not an actual schema mismatch — safe to adopt as-is.)
export class Baseline1785270246424 implements MigrationInterface {
    name = 'Baseline1785270246424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "debits" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dueDate" date NOT NULL, "amount" decimal(10,2) NOT NULL, "classId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "comment" text, "entitlement" text, "studentId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "date" date NOT NULL, "amount" decimal(10,2) NOT NULL, "comment" text, "proofType" text NOT NULL, "fiscalized" boolean NOT NULL DEFAULT (0), "invoiceId" integer, "studentId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startTime" varchar NOT NULL, "lessonLength" varchar NOT NULL, "roomId" integer, "groupId" integer, "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar, "discount" decimal(5,2), "semester" varchar NOT NULL, "extraNotes" text NOT NULL DEFAULT (''), "active" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "studentIds" json NOT NULL DEFAULT ('[]'), "classIds" json NOT NULL DEFAULT ('[]'), "minStartDate" json, "maxEndDate" json, "teacherId" integer NOT NULL, "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "numberOfHours" integer, "roomId" integer, "comment" text NOT NULL DEFAULT (''), "colorHex" text, "startHour" time, "lessonLength" time, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "teacher" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "course" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL DEFAULT (''), "cost" decimal(10,2) NOT NULL, "numberOfHours" decimal(10,2) NOT NULL, "lessonLength" time, "pattern" varchar(20) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "room" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "capacity" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "group_template" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "templateName" varchar NOT NULL, "isActive" boolean DEFAULT (1), "studentIds" json, "classIds" json, "teacherId" integer, "cost" decimal(10,2), "unitCost" decimal(10,2), "comment" text, "minStartDate" json, "maxEndDate" json, "colorHex" text, "numberOfHours" integer, "startHour" time, "lessonLength" time, "roomId" integer, "courseId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "institutionName" varchar NOT NULL DEFAULT ('Institution'), "currency" varchar NOT NULL DEFAULT ('PLN'))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "roles" text NOT NULL DEFAULT (''), "teacherId" integer, "studentId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "student_classes_class" ("studentId" integer NOT NULL, "classId" integer NOT NULL, PRIMARY KEY ("studentId", "classId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e224193a4e2c8e1b28afa74e9" ON "student_classes_class" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d4b9aa106e0113abd39f06182" ON "student_classes_class" ("classId") `);
        await queryRunner.query(`CREATE TABLE "temporary_class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startTime" varchar NOT NULL, "lessonLength" varchar NOT NULL, "roomId" integer, "groupId" integer, "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_class"("id", "startTime", "lessonLength", "roomId", "groupId", "teacherId", "cost", "comment", "attendedStudentsIds", "plannedStudentsIds", "createdAt", "updatedAt") SELECT "id", "startTime", "lessonLength", "roomId", "groupId", "teacherId", "cost", "comment", "attendedStudentsIds", "plannedStudentsIds", "createdAt", "updatedAt" FROM "class"`);
        await queryRunner.query(`DROP TABLE "class"`);
        await queryRunner.query(`ALTER TABLE "temporary_class" RENAME TO "class"`);
        await queryRunner.query(`CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "studentIds" json NOT NULL DEFAULT ('[]'), "classIds" json NOT NULL DEFAULT ('[]'), "minStartDate" json, "maxEndDate" json, "teacherId" integer NOT NULL, "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "numberOfHours" integer, "roomId" integer, "comment" text NOT NULL DEFAULT (''), "colorHex" text, "startHour" time, "lessonLength" time, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_group"("id", "name", "isActive", "studentIds", "classIds", "minStartDate", "maxEndDate", "teacherId", "cost", "unitCost", "numberOfHours", "roomId", "comment", "colorHex", "startHour", "lessonLength", "createdAt", "updatedAt") SELECT "id", "name", "isActive", "studentIds", "classIds", "minStartDate", "maxEndDate", "teacherId", "cost", "unitCost", "numberOfHours", "roomId", "comment", "colorHex", "startHour", "lessonLength", "createdAt", "updatedAt" FROM "group"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);
        await queryRunner.query(`DROP INDEX "IDX_4e224193a4e2c8e1b28afa74e9"`);
        await queryRunner.query(`DROP INDEX "IDX_3d4b9aa106e0113abd39f06182"`);
        await queryRunner.query(`CREATE TABLE "temporary_student_classes_class" ("studentId" integer NOT NULL, "classId" integer NOT NULL, CONSTRAINT "FK_4e224193a4e2c8e1b28afa74e9d" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_3d4b9aa106e0113abd39f061827" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("studentId", "classId"))`);
        await queryRunner.query(`INSERT INTO "temporary_student_classes_class"("studentId", "classId") SELECT "studentId", "classId" FROM "student_classes_class"`);
        await queryRunner.query(`DROP TABLE "student_classes_class"`);
        await queryRunner.query(`ALTER TABLE "temporary_student_classes_class" RENAME TO "student_classes_class"`);
        await queryRunner.query(`CREATE INDEX "IDX_4e224193a4e2c8e1b28afa74e9" ON "student_classes_class" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d4b9aa106e0113abd39f06182" ON "student_classes_class" ("classId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_3d4b9aa106e0113abd39f06182"`);
        await queryRunner.query(`DROP INDEX "IDX_4e224193a4e2c8e1b28afa74e9"`);
        await queryRunner.query(`ALTER TABLE "student_classes_class" RENAME TO "temporary_student_classes_class"`);
        await queryRunner.query(`CREATE TABLE "student_classes_class" ("studentId" integer NOT NULL, "classId" integer NOT NULL, PRIMARY KEY ("studentId", "classId"))`);
        await queryRunner.query(`INSERT INTO "student_classes_class"("studentId", "classId") SELECT "studentId", "classId" FROM "temporary_student_classes_class"`);
        await queryRunner.query(`DROP TABLE "temporary_student_classes_class"`);
        await queryRunner.query(`CREATE INDEX "IDX_3d4b9aa106e0113abd39f06182" ON "student_classes_class" ("classId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e224193a4e2c8e1b28afa74e9" ON "student_classes_class" ("studentId") `);
        await queryRunner.query(`ALTER TABLE "group" RENAME TO "temporary_group"`);
        await queryRunner.query(`CREATE TABLE "group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "studentIds" json NOT NULL DEFAULT ('[]'), "classIds" json NOT NULL DEFAULT ('[]'), "minStartDate" json, "maxEndDate" json, "teacherId" integer NOT NULL, "cost" decimal(10,2) NOT NULL, "unitCost" decimal(10,2) NOT NULL, "numberOfHours" integer, "roomId" integer, "comment" text NOT NULL DEFAULT (''), "colorHex" text, "startHour" time, "lessonLength" time, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "group"("id", "name", "isActive", "studentIds", "classIds", "minStartDate", "maxEndDate", "teacherId", "cost", "unitCost", "numberOfHours", "roomId", "comment", "colorHex", "startHour", "lessonLength", "createdAt", "updatedAt") SELECT "id", "name", "isActive", "studentIds", "classIds", "minStartDate", "maxEndDate", "teacherId", "cost", "unitCost", "numberOfHours", "roomId", "comment", "colorHex", "startHour", "lessonLength", "createdAt", "updatedAt" FROM "temporary_group"`);
        await queryRunner.query(`DROP TABLE "temporary_group"`);
        await queryRunner.query(`ALTER TABLE "class" RENAME TO "temporary_class"`);
        await queryRunner.query(`CREATE TABLE "class" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startTime" varchar NOT NULL, "lessonLength" varchar NOT NULL, "roomId" integer, "groupId" integer, "teacherId" integer, "cost" decimal(10,2) NOT NULL, "comment" text, "attendedStudentsIds" json NOT NULL DEFAULT ('[]'), "plannedStudentsIds" json NOT NULL DEFAULT ('[]'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "class"("id", "startTime", "lessonLength", "roomId", "groupId", "teacherId", "cost", "comment", "attendedStudentsIds", "plannedStudentsIds", "createdAt", "updatedAt") SELECT "id", "startTime", "lessonLength", "roomId", "groupId", "teacherId", "cost", "comment", "attendedStudentsIds", "plannedStudentsIds", "createdAt", "updatedAt" FROM "temporary_class"`);
        await queryRunner.query(`DROP TABLE "temporary_class"`);
        await queryRunner.query(`DROP INDEX "IDX_3d4b9aa106e0113abd39f06182"`);
        await queryRunner.query(`DROP INDEX "IDX_4e224193a4e2c8e1b28afa74e9"`);
        await queryRunner.query(`DROP TABLE "student_classes_class"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "group_template"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TABLE "teacher"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "student"`);
        await queryRunner.query(`DROP TABLE "class"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "debits"`);
    }

}
