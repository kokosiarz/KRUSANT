import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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
    teacherId?: number | null;
    studentId?: number | null;
  }) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      name: payload.name, 
      roles: payload.roles ?? [],
      teacherId: payload.teacherId ?? null,
      studentId: payload.studentId ?? null,
    };
  }
}
