process.env.JWT_SECRET = 'test-secret';

import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  const payload = {
    sub: 1,
    email: 'user@example.com',
    name: 'Test User',
    roles: ['teacher'],
    studentId: null,
  };

  function makeStrategy(usersService: Partial<UsersService>) {
    return new JwtStrategy(usersService as UsersService);
  }

  it('returns the fresh roles/studentId from the DB, not the token payload', async () => {
    const findById = jest.fn().mockResolvedValue({
      id: 1,
      roles: ['admin'], // changed since the token was issued
      studentId: 42,
    });
    const strategy = makeStrategy({ findById });

    const result = await strategy.validate(payload);

    expect(findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
      roles: ['admin'],
      studentId: 42,
    });
  });

  it('throws Unauthorized when the user no longer exists (deleted since the token was issued)', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const strategy = makeStrategy({ findById });

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('defaults roles/studentId to empty/null when the DB row has none set', async () => {
    const findById = jest.fn().mockResolvedValue({
      id: 1,
      roles: undefined,
      studentId: undefined,
    });
    const strategy = makeStrategy({ findById });

    const result = await strategy.validate(payload);

    expect(result.roles).toEqual([]);
    expect(result.studentId).toBeNull();
  });
});
