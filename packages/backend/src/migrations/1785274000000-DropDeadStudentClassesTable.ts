import { MigrationInterface, QueryRunner } from 'typeorm';

// Drops `student_classes_class`, the join table created by a `@ManyToMany` +
// `@JoinTable()` on Student.classes that was never usable:
//   - its inverse side pointed at `ClassEntity.attendedStudentsIds`, a plain
//     JSON `@Column`, not a relation property;
//   - nothing in the codebase ever loaded the relation;
//   - the table held 0 rows in production.
//
// Attendance is (and remains) tracked via ClassEntity.attendedStudentsIds /
// plannedStudentsIds, so no data moves here — this is pure removal of a
// half-finished attempt.
export class DropDeadStudentClassesTable1785274000000
  implements MigrationInterface
{
  name = 'DropDeadStudentClassesTable1785274000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_classes_class"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreated empty — it never held data.
    await queryRunner.query(
      `CREATE TABLE "student_classes_class" ("studentId" integer NOT NULL, "classId" integer NOT NULL, PRIMARY KEY ("studentId", "classId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e224193a4e2c8e1b28afa74e9" ON "student_classes_class" ("studentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d4b9aa106e0113abd39f06182" ON "student_classes_class" ("classId") `,
    );
  }
}
