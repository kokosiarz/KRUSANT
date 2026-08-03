import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

/**
 * Self-signup is OFF. Accounts are created by an admin on the Users page; the
 * only sign-in paths are a password an admin issued, or Google against an
 * account that already exists.
 *
 * The auto-provisioning branch below is kept behind this flag rather than
 * deleted, so opening signup back up is a config change and not a rewrite. Set
 * ALLOW_SELF_SIGNUP=true to restore the old behaviour, where any Google account
 * could sign in and got a roleless user created on the fly.
 */
export const selfSignupEnabled = () => process.env.ALLOW_SELF_SIGNUP === 'true';

type AuthInput = { email: string; password: string };
type SignInData = {
  id: number;
  email: string;
  name: string;
  roles: string[];
  studentId?: number | null;
  mustChangePassword: boolean;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) return null;
    const ok = await this.usersService.verifyPassword(user, input.password);
    if (!ok) return null;

    // Checked only after the password matches, so this never reveals whether a
    // given address has an account.
    if (this.usersService.isTempPasswordExpired(user)) {
      throw new UnauthorizedException(
        'Hasło tymczasowe wygasło. Poproś administratora o nowe.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
      mustChangePassword: user.mustChangePassword ?? false,
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
      if (!selfSignupEnabled()) {
        // The account has to exist first. Matching is by email address, so an
        // admin creating a user with someone's Google address is all it takes
        // for that person to sign in with Google.
        this.logger.warn(
          `Rejected Google sign-in for ${profile.email}: no account exists`,
        );
        throw new UnauthorizedException(
          'Brak konta dla tego adresu e-mail. Skontaktuj się z administratorem.',
        );
      }

      // Self-signup path, disabled by default (see selfSignupEnabled above).
      // New accounts start with no roles, so an admin still has to grant access
      // before the user can reach anything.
      user = await this.usersService.create({
        email: profile.email,
        name: googleName || null,
        roles: [],
        studentId: null,
      });
    }

    // Reaching the mailbox the temporary password was sent to is proof enough
    // of ownership, so it stops blocking them. The password's own 24h expiry is
    // left untouched — see UsersService.clearPasswordChangeRequirement.
    if (user.mustChangePassword) {
      await this.usersService.clearPasswordChangeRequirement(user.id);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || googleName || user.email,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
      mustChangePassword: false,
    };
  }
}
