import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
  ScryptOptions,
} from 'crypto';
import {
  MIN_PASSWORD_LENGTH,
  TEMP_PASSWORD_ALPHABET,
  TEMP_PASSWORD_LENGTH,
  TEMP_PASSWORD_TTL_MS,
} from './users.constants';

/**
 * A newly created account plus the one-time plaintext password to deliver to
 * its owner. The plaintext exists only in this object — it is never stored,
 * logged, or returned by any read endpoint.
 */
export interface IssuedCredentials {
  user: User;
  tempPassword: string;
  expiresAt: Date;
}

// Pinned explicitly (these match Node's current scrypt defaults) so a future
// change to Node's defaults can't silently change what a stored hash means.
const SCRYPT_OPTIONS: ScryptOptions = { N: 16384, r: 8, p: 1 };
const SCRYPT_KEYLEN = 32;
const SALT_BYTES = 16;

function scrypt(
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  /**
   * Creates an account with no usable password. The stored hash is random and
   * nobody — including the account's owner — knows the plaintext, so password
   * login is effectively disabled until an admin issues a temporary password.
   *
   * Only the Google sign-in path uses this, and only when self-signup is
   * explicitly enabled (see AuthService.validateGoogleUser).
   */
  async create(params: {
    email: string;
    name?: string | null;
    roles?: string[];
    studentId?: number | null;
  }): Promise<User> {
    const { email, name = null, roles = [], studentId = null } = params;
    const user = this.usersRepo.create({
      email,
      name,
      passwordHash: await this.hashPassword(this.generateTempPassword()),
      roles,
      studentId,
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    });
    return this.usersRepo.save(user);
  }

  /**
   * Creates an account holding a temporary password that must be changed
   * within 24h. Returns the plaintext exactly once so the caller can email it
   * — it cannot be recovered afterwards.
   */
  async createWithTempPassword(params: {
    email: string;
    name?: string | null;
    roles?: string[];
    studentId?: number | null;
  }): Promise<IssuedCredentials> {
    const { email, name = null, roles = [], studentId = null } = params;
    const tempPassword = this.generateTempPassword();
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS);
    const user = this.usersRepo.create({
      email,
      name,
      passwordHash: await this.hashPassword(tempPassword),
      roles,
      studentId,
      mustChangePassword: true,
      tempPasswordExpiresAt: expiresAt,
    });
    return { user: await this.usersRepo.save(user), tempPassword, expiresAt };
  }

  /**
   * Replaces an existing account's password with a fresh temporary one — the
   * admin's "reset password" action, and the only way back in for someone whose
   * temporary password expired.
   */
  async issueTempPassword(userId: number): Promise<IssuedCredentials> {
    const user = await this.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    const tempPassword = this.generateTempPassword();
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS);
    await this.usersRepo.update(userId, {
      passwordHash: await this.hashPassword(tempPassword),
      mustChangePassword: true,
      tempPasswordExpiresAt: expiresAt,
    });
    return { user: await this.findById(userId), tempPassword, expiresAt };
  }

  /** True once an admin-issued temporary password is past its 24h window. */
  isTempPasswordExpired(user: User): boolean {
    return (
      !!user.tempPasswordExpiresAt &&
      new Date(user.tempPasswordExpiresAt).getTime() < Date.now()
    );
  }

  /**
   * The user picking their own password: clears both the change requirement and
   * the expiry, so the new password is permanent.
   */
  async changeOwnPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (!(await this.verifyPassword(user, currentPassword))) {
      throw new UnauthorizedException('Obecne hasło jest nieprawidłowe.');
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Nowe hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`,
      );
    }
    if (await this.verifyPassword(user, newPassword)) {
      throw new BadRequestException('Nowe hasło musi różnić się od obecnego.');
    }
    await this.usersRepo.update(userId, {
      passwordHash: await this.hashPassword(newPassword),
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    });
  }

  /**
   * Signing in with Google proves the person owns the mailbox the temporary
   * password was sent to, so it stops blocking them. `tempPasswordExpiresAt` is
   * deliberately left alone: the emailed password still dies on schedule.
   */
  async clearPasswordChangeRequirement(userId: number): Promise<void> {
    await this.usersRepo.update(userId, { mustChangePassword: false });
  }

  async findByRole(role: string): Promise<User[]> {
    // `roles` is a simple-array (comma-separated text), so filter in JS
    // rather than with a LIKE that could match a role name as a substring.
    const users = await this.usersRepo.find();
    return users.filter((user) => (user.roles ?? []).includes(role));
  }

  async update(
    userId: number,
    params: {
      email?: string;
      name?: string | null;
      roles?: string[];
      studentId?: number | null;
    },
  ): Promise<User> {
    const updates: any = {};
    if (params.email) updates.email = params.email;
    if (params.name !== undefined) updates.name = params.name;
    if (params.roles !== undefined)
      updates.roles = params.roles.map((r) => r.toLowerCase());
    if (params.studentId !== undefined) updates.studentId = params.studentId;

    await this.usersRepo.update(userId, updates);
    return this.findById(userId);
  }

  async remove(userId: number): Promise<void> {
    try {
      await this.usersRepo.delete(userId);
    } catch (error) {
      // A user who still teaches a group is protected by an ON DELETE
      // RESTRICT foreign key; surface that as a 409 rather than a raw 500.
      if (
        error instanceof QueryFailedError &&
        error.message.includes('FOREIGN KEY constraint failed')
      ) {
        throw new ConflictException(
          'Nie można usunąć użytkownika: jest przypisany jako nauczyciel do istniejących grup lub zajęć.',
        );
      }
      throw error;
    }
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) return false;
    const [salt, storedHashHex] = user.passwordHash.split('.');
    if (!salt || !storedHashHex) return false;
    const storedHash = Buffer.from(storedHashHex, 'hex');
    const hash = await scrypt(
      password,
      salt,
      storedHash.length,
      SCRYPT_OPTIONS,
    );
    if (hash.length !== storedHash.length) return false;
    return timingSafeEqual(hash, storedHash);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES).toString('hex');
    const hash = await scrypt(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
    return `${salt}.${hash.toString('hex')}`;
  }

  /**
   * `randomInt` draws uniformly over the alphabet — unlike `% alphabet.length`
   * on a random byte, which would quietly favour the first few characters.
   */
  private generateTempPassword(): string {
    let password = '';
    for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
      password +=
        TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)];
    }
    return password;
  }
}
