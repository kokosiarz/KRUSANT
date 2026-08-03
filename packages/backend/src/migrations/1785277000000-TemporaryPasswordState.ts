import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds the two columns that back admin-issued temporary passwords:
//   - mustChangePassword: the account is holding a temp password and can do
//     nothing but change it (enforced by ForcePasswordChangeGuard);
//   - tempPasswordExpiresAt: 24h deadline, after which the temp password stops
//     authenticating and an admin has to issue a new one.
//
// Plain ADD/DROP COLUMN on "user" — no table rebuild, so none of the SQLite
// foreign-key rebuild caveats in CLAUDE.md apply here.
//
// Existing accounts are backfilled to (0, NULL): their passwords are already
// self-chosen, so nobody gets locked out by this migration.
export class TemporaryPasswordState1785277000000 implements MigrationInterface {
  name = 'TemporaryPasswordState1785277000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "mustChangePassword" boolean NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "tempPasswordExpiresAt" datetime`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "tempPasswordExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "mustChangePassword"`,
    );
  }
}
