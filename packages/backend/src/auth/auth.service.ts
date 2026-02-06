import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TeachersService } from 'src/teachers/teachers.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Role } from './roles.enum';

type AuthInput = { email: string; password: string };
type SignInData = { 
  id: number; 
  email: string; 
  name: string; 
  roles: string[];
  teacherId?: number | null;
  studentId?: number | null;
};
type AuthOutput = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private teachersService: TeachersService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthOutput | null> {
    // Placeholder logic for authentication
    const signIn = await this.validate(input);
    if (!signIn) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.getToken(signIn);
    return {
      user: {
        id: signIn.id.toString(),
        email: signIn.email,
        name: signIn.name,
      },
      token: accessToken,
    };
  }

  async validate(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) return null;
    const ok = await this.usersService.verifyPassword(user, input.password);
    if (!ok) return null;

    // Derive name: prefer teacher profile name if linked, else email
    let name = user.email;
    if (user.teacherId) {
      const teacher = await this.teachersService.findOneById(user.teacherId);
      if (teacher?.name) name = teacher.name;
    }
    return { 
      id: user.id, 
      email: user.email, 
      name, 
      roles: user.roles ?? [],
      teacherId: user.teacherId ?? null,
      studentId: user.studentId ?? null,
    };
  }

  async getToken(data: SignInData): Promise<string> {
    const payload = {
      sub: data.id,
      email: data.email,
      name: data.name,
      roles: data.roles,
      teacherId: data.teacherId,
      studentId: data.studentId,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  }): Promise<SignInData> {
    // Check if user exists by email
    let user = await this.usersService.findByEmail(profile.email);
    
    if (!user) {
      // Create new user with Google profile
      user = await this.usersService.create({
        email: profile.email,
        roles: [Role.Teacher], // Default role, adjust as needed
        teacherId: null,
        studentId: null,
      });
    }

    // Derive name: prefer teacher profile name if linked, else use Google name
    let name = `${profile.firstName} ${profile.lastName}`;
    if (user.teacherId) {
      const teacher = await this.teachersService.findOneById(user.teacherId);
      if (teacher?.name) name = teacher.name;
    }

    return {
      id: user.id,
      email: user.email,
      name,
      roles: user.roles ?? [],
      teacherId: user.teacherId ?? null,
      studentId: user.studentId ?? null,
    };
  }

  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.setPassword(user.id, newPassword);
    return { message: 'Password reset successfully' };
  }

  // One-time backfill: create Users for Teachers not yet linked
  async backfillUsersFromTeachers(): Promise<{ created: number }> {
    if (process.env.ALLOW_BACKFILL !== 'true') {
      throw new ForbiddenException('Backfill disabled');
    }
    const teachers = await this.teachersService.findAll();
    let created = 0;
    for (const t of teachers) {
      if (!t.email) continue;
      const existing = await this.usersService.findByEmail(t.email);
      if (existing) continue;
      await this.usersService.create({
        email: t.email,
        roles: [Role.Teacher],
        teacherId: t.id,
      });
      created++;
    }
    return { created };
  }
}
