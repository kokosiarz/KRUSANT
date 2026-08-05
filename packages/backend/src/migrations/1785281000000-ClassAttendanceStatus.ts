import { MigrationInterface, QueryRunner } from 'typeorm';

// Replaces the binary class_attended_students join table with class_attendance,
// which carries a status ('present' | 'absent' | 'rescheduled') per
// (classId, studentId) instead of a row's mere presence meaning "attended".
// A plain @ManyToMany/@JoinTable has no room for that extra column, so this
// had to become a real table rather than staying a join table like
// class_planned_students (untouched by this migration).
//
// Every existing row meant "attended", so it backfills 1:1 to status =
// 'present'. Same reversible shape as ClassRosterJoinTables1785276000000: no
// table rebuild needed, since nothing else references class_attended_students.
export class ClassAttendanceStatus1785281000000 implements MigrationInterface {
  name = 'ClassAttendanceStatus1785281000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "class_attendance" ("classId" integer NOT NULL, "studentId" integer NOT NULL, "status" varchar NOT NULL, CONSTRAINT "CHK_class_attendance_status" CHECK ("status" IN ('present', 'absent', 'rescheduled')), CONSTRAINT "FK_class_attendance_class" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_class_attendance_student" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("classId", "studentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_class_attendance_classId" ON "class_attendance" ("classId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_class_attendance_studentId" ON "class_attendance" ("studentId")`,
    );

    await queryRunner.query(
      `INSERT INTO "class_attendance" ("classId", "studentId", "status")
       SELECT "classId", "studentId", 'present' FROM "class_attended_students"`,
    );

    await queryRunner.query(`DROP TABLE "class_attended_students"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "class_attended_students" ("classId" integer NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_class_attended_students_class" FOREIGN KEY ("classId") REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_class_attended_students_student" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("classId", "studentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attended_classId" ON "class_attended_students" ("classId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attended_studentId" ON "class_attended_students" ("studentId")`,
    );

    // Only 'present' rows map back — 'absent'/'rescheduled' have no
    // representation in the old binary shape, so they're dropped on downgrade.
    await queryRunner.query(
      `INSERT INTO "class_attended_students" ("classId", "studentId")
       SELECT "classId", "studentId" FROM "class_attendance" WHERE "status" = 'present'`,
    );

    await queryRunner.query(`DROP TABLE "class_attendance"`);
  }
}
