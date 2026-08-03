import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { ALLOW_PENDING_PASSWORD_KEY } from '../allow-pending-password.decorator';

/**
 * While a user is holding an admin-issued temporary password, this blocks every
 * route except the handful needed to change it. Without it "must change the
 * password" would be frontend routing only — anyone could keep using the API
 * with the temporary credentials by talking to it directly.
 */
@Injectable()
export class ForcePasswordChangeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const exempt = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_PASSWORD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (exempt) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    if (user?.mustChangePassword) {
      throw new ForbiddenException(
        'Musisz zmienić hasło tymczasowe, zanim skorzystasz z aplikacji.',
      );
    }
    return true;
  }
}
