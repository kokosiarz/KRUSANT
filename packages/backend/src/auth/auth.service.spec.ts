import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

// Self-signup is off: an admin creates every account. Google sign-in still
// works, but only against an account that already exists.
describe('AuthService', () => {
  const googleProfile = {
    googleId: 'g-1',
    email: 'nowy@example.com',
    firstName: 'Jan',
    lastName: 'Kowalski',
    picture: '',
  };

  const makeService = (usersService: Partial<UsersService>) =>
    new AuthService(
      usersService as UsersService,
      {
        signAsync: jest.fn().mockResolvedValue('token'),
      } as unknown as JwtService,
    );

  afterEach(() => {
    delete process.env.ALLOW_SELF_SIGNUP;
  });

  describe('validateGoogleUser', () => {
    it('rejects a Google account nobody has created, instead of provisioning one', async () => {
      const create = jest.fn();
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue(null),
        create,
      });

      await expect(service.validateGoogleUser(googleProfile)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('signs in an existing account matched by email address', async () => {
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue({
          id: 7,
          email: 'nowy@example.com',
          name: 'Jan Kowalski',
          roles: ['teacher'],
          studentId: null,
        }),
        clearPasswordChangeRequirement: jest.fn(),
      });

      const result = await service.validateGoogleUser(googleProfile);

      expect(result.id).toBe(7);
      expect(result.roles).toEqual(['teacher']);
    });

    it('clears a pending password change: reaching the mailbox proves ownership', async () => {
      const clearPasswordChangeRequirement = jest.fn();
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue({
          id: 7,
          email: 'nowy@example.com',
          name: null,
          roles: [],
          mustChangePassword: true,
        }),
        clearPasswordChangeRequirement,
      });

      const result = await service.validateGoogleUser(googleProfile);

      expect(clearPasswordChangeRequirement).toHaveBeenCalledWith(7);
      expect(result.mustChangePassword).toBe(false);
    });

    it('restores auto-provisioning when ALLOW_SELF_SIGNUP is on, with no roles granted', async () => {
      process.env.ALLOW_SELF_SIGNUP = 'true';
      const create = jest.fn().mockResolvedValue({
        id: 9,
        email: 'nowy@example.com',
        name: 'Jan Kowalski',
        roles: [],
      });
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue(null),
        create,
        clearPasswordChangeRequirement: jest.fn(),
      });

      const result = await service.validateGoogleUser(googleProfile);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'nowy@example.com', roles: [] }),
      );
      expect(result.roles).toEqual([]);
    });
  });

  describe('validate', () => {
    const user = {
      id: 1,
      email: 'a@example.com',
      name: 'A',
      roles: ['admin'],
      studentId: null,
      mustChangePassword: true,
    };

    it('refuses an expired temporary password even though it is the right password', async () => {
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue(user),
        verifyPassword: jest.fn().mockResolvedValue(true),
        isTempPasswordExpired: jest.fn().mockReturnValue(true),
      });

      await expect(
        service.validate({ email: 'a@example.com', password: 'temp' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('signs in on a temporary password that is still valid, flagged for change', async () => {
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue(user),
        verifyPassword: jest.fn().mockResolvedValue(true),
        isTempPasswordExpired: jest.fn().mockReturnValue(false),
      });

      const result = await service.validate({
        email: 'a@example.com',
        password: 'temp',
      });

      expect(result?.mustChangePassword).toBe(true);
    });

    it('returns null on a wrong password without ever checking expiry', async () => {
      const isTempPasswordExpired = jest.fn();
      const service = makeService({
        findByEmail: jest.fn().mockResolvedValue(user),
        verifyPassword: jest.fn().mockResolvedValue(false),
        isTempPasswordExpired,
      });

      expect(
        await service.validate({ email: 'a@example.com', password: 'wrong' }),
      ).toBeNull();
      expect(isTempPasswordExpired).not.toHaveBeenCalled();
    });
  });
});
