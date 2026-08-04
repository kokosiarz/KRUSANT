import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds `passkey`: registered WebAuthn credentials, so people can sign in with
// Face ID / Touch ID / Windows Hello instead of a password.
//
// Only public keys are stored — the private half never leaves the device's
// secure enclave. `credentialId` is unique because it's what an authentication
// response identifies itself by; two rows sharing one would make the lookup
// ambiguous.
//
// ON DELETE CASCADE: deleting a user must take their credentials with them,
// or a later account reusing that id would inherit someone else's keys.
//
// Pure addition, nothing else is touched.
export class Passkeys1785280000000 implements MigrationInterface {
  name = 'Passkeys1785280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "passkey" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "userId" integer NOT NULL,
        "credentialId" varchar NOT NULL,
        "publicKey" text NOT NULL,
        "counter" integer NOT NULL DEFAULT (0),
        "transports" text NOT NULL DEFAULT (''),
        "label" varchar NOT NULL,
        "backedUp" boolean NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "lastUsedAt" datetime,
        CONSTRAINT "FK_passkey_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_passkey_credentialId" ON "passkey" ("credentialId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_passkey_userId" ON "passkey" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_passkey_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_passkey_credentialId"`);
    await queryRunner.query(`DROP TABLE "passkey"`);
  }
}
