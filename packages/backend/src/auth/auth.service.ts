import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

type AuthInput = { email: string; password: string };
type SignInData = {
  id: number;
  email: string;
  name: string;
  roles: string[];
  studentId?: number | null;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) return null;
    const ok = await this.usersService.verifyPassword(user, input.password);
    if (!ok) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
    };
  }

  async getToken(data: SignInData): Promise<string> {
    const payload = {
      sub: data.id,
      email: data.email,
      name: data.name,
      roles: data.roles,
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
    const googleName = `${profile.firstName} ${profile.lastName}`.trim();
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      // New Google accounts start with no roles — an admin has to grant
      // access explicitly via Users Management, rather than anyone with a
      // Google account self-provisioning as a teacher.
      user = await this.usersService.create({
        email: profile.email,
        name: googleName || null,
        roles: [],
        studentId: null,
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || googleName || user.email,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
    };
  }
}
