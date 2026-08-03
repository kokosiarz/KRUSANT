import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ForcePasswordChangeGuard } from './force-password-change.guard';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { ALLOW_PENDING_PASSWORD_KEY } from '../allow-pending-password.decorator';

// The guard is what makes "must change password" real rather than a frontend
// suggestion — without it the temporary password is a fully working credential.
describe('ForcePasswordChangeGuard', () => {
  const contextFor = (user: unknown) =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  /** Reflector that reports only the given metadata keys as set. */
  const reflectorWith = (...setKeys: string[]) =>
    ({
      getAllAndOverride: (key: string) => setKeys.includes(key) || undefined,
    }) as unknown as Reflector;

  const guard = (...setKeys: string[]) =>
    new ForcePasswordChangeGuard(reflectorWith(...setKeys));

  it('blocks a user who still owes a password change', () => {
    expect(() =>
      guard().canActivate(contextFor({ id: 1, mustChangePassword: true })),
    ).toThrow(ForbiddenException);
  });

  it('lets a user through once the password has been changed', () => {
    expect(
      guard().canActivate(contextFor({ id: 1, mustChangePassword: false })),
    ).toBe(true);
  });

  it('lets through a user with no flag at all (pre-existing accounts)', () => {
    expect(guard().canActivate(contextFor({ id: 1 }))).toBe(true);
  });

  it('exempts routes marked @AllowPendingPassword — otherwise the change itself would be blocked', () => {
    expect(
      guard(ALLOW_PENDING_PASSWORD_KEY).canActivate(
        contextFor({ id: 1, mustChangePassword: true }),
      ),
    ).toBe(true);
  });

  it('ignores public routes, which have no user to check', () => {
    expect(guard(IS_PUBLIC_KEY).canActivate(contextFor(undefined))).toBe(true);
  });
});
