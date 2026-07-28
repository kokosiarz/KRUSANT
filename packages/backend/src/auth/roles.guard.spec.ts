import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './roles.enum';

function makeContext(roles: string[] | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: roles ? { roles } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows any authenticated user when no @Roles() metadata is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(['student']))).toBe(true);
  });

  it('allows any authenticated user when @Roles() is given no roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    expect(guard.canActivate(makeContext(['student']))).toBe(true);
  });

  it('allows a user whose role matches one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.Admin, Role.Teacher]);
    expect(guard.canActivate(makeContext(['teacher']))).toBe(true);
  });

  it('denies a user whose role matches none of the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(guard.canActivate(makeContext(['teacher', 'student']))).toBe(false);
  });

  it('denies a request with no user on it at all', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });
});
