import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  ScryptOptions,
} from 'crypto';

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

  async create(params: {
    email: string;
    name?: string | null;
    password?: string;
    roles?: string[];
    studentId?: number | null;
  }): Promise<User> {
    const { email, name = null, password, roles = [], studentId = null } = params;
    const passwordHash = password
      ? await this.hashPassword(password)
      : await this.hashPassword(this.generateTempPassword());
    const user = this.usersRepo.create({
      email,
      name,
      passwordHash,
      roles: roles,
      studentId,
    });
    return this.usersRepo.save(user);
  }

  async findByRole(role: string): Promise<User[]> {
    // `roles` is a simple-array (comma-separated text), so filter in JS
    // rather than with a LIKE that could match a role name as a substring.
    const users = await this.usersRepo.find();
    return users.filter((user) => (user.roles ?? []).includes(role));
  }

  async setPassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
    await this.usersRepo.update(userId, { passwordHash });
  }

  async update(
    userId: number,
    params: {
      email?: string;
      name?: string | null;
      password?: string;
      roles?: string[];
      studentId?: number | null;
    },
  ): Promise<User> {
    const updates: any = {};
    if (params.email) updates.email = params.email;
    if (params.name !== undefined) updates.name = params.name;
    if (params.password)
      updates.passwordHash = await this.hashPassword(params.password);
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

  private generateTempPassword(): string {
    return randomBytes(9).toString('base64');
  }
}
