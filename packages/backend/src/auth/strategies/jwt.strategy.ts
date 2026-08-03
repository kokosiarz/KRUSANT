import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    name: string;
    roles?: string[];
    studentId?: number | null;
  }) {
    // Re-check roles/studentId against the DB on every request so a
    // revoked role or a deleted user takes effect immediately instead of
    // waiting out the token's lifetime — the payload's own copy of these
    // fields is stale by design (baked in at login time).
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
      // Read live for the same reason: baking it into the token would keep a
      // user trapped on the change-password screen for the token's full 24h
      // lifetime after they had already changed it.
      mustChangePassword: user.mustChangePassword ?? false,
    };
  }
}
