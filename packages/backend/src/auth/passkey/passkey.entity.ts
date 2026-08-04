import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * One registered WebAuthn credential — in practice one device family, since a
 * passkey created on an iPhone syncs to that person's Mac and iPad through
 * iCloud Keychain and stays a single credential.
 *
 * Only the *public* key is stored. The private half never leaves the device's
 * secure enclave, which is what makes this phishing-proof: there is nothing
 * here worth stealing, and the credential is bound to our domain so it can't
 * be replayed against a lookalike site.
 */
@Entity('passkey')
export class Passkey {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'integer' })
  userId: number;

  /** Base64URL credential id, as returned by the authenticator. */
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  credentialId: string;

  /** Base64URL-encoded COSE public key. */
  @Column({ type: 'text' })
  publicKey: string;

  /**
   * Signature counter. Authenticators that implement it increment on every
   * use; a value that goes backwards suggests a cloned credential. Synced
   * passkeys generally report 0 forever, so this can't be enforced strictly.
   */
  @Column({ type: 'integer', default: 0 })
  counter: number;

  /** e.g. ["internal","hybrid"] — lets the browser hint how to reach the key. */
  @Column({ type: 'simple-array', default: '' })
  transports: string[];

  /** Shown in the management list so a user can tell their keys apart. */
  @Column({ type: 'varchar' })
  label: string;

  /** True for iCloud/Google-synced passkeys, false for a single device. */
  @Column({ type: 'boolean', default: false })
  backedUp: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt: Date | null;
}
