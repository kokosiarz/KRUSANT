import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

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
    password?: string; 
    roles?: string[]; 
    teacherId?: number | null;
    studentId?: number | null;
  }): Promise<User> {
    const { email, password, roles = [], teacherId = null, studentId = null } = params;
    const passwordHash = password ? await this.hashPassword(password) : await this.hashPassword(this.generateTempPassword());
    const user = this.usersRepo.create({ email, passwordHash, roles: roles, teacherId, studentId });
    return this.usersRepo.save(user);
  }

  async setPassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
    await this.usersRepo.update(userId, { passwordHash });
  }

  async update(userId: number, params: { 
    email?: string; 
    password?: string; 
    roles?: string[]; 
    teacherId?: number | null;
    studentId?: number | null;
  }): Promise<User> {
    const updates: any = {};
    if (params.email) updates.email = params.email;
    if (params.password) updates.passwordHash = await this.hashPassword(params.password);
    if (params.roles !== undefined) updates.roles = params.roles.map(r => r.toLowerCase());
    if (params.teacherId !== undefined) updates.teacherId = params.teacherId;
    if (params.studentId !== undefined) updates.studentId = params.studentId;
    
    await this.usersRepo.update(userId, updates);
    return this.findById(userId);
  }

  async remove(userId: number): Promise<void> {
    await this.usersRepo.delete(userId);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    const [salt, storedHash] = user.passwordHash.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return storedHash === hash.toString('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  }

  private generateTempPassword(): string {
    return randomBytes(9).toString('base64');
  }
}
