import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException();
    }
    try {
      const tokenPayload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        roles?: string[];
        teacherId?: number | null;
        studentId?: number | null;
      }>(accessToken);
      request.user = { 
        id: tokenPayload.sub, 
        email: tokenPayload.email,
        roles: tokenPayload.roles ?? [],
        teacherId: tokenPayload.teacherId ?? null,
        studentId: tokenPayload.studentId ?? null,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
