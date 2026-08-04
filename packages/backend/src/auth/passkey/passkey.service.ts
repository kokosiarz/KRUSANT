import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { Passkey } from './passkey.entity';
import { ChallengeStore } from './challenge.store';
import { getRpId, getRpOrigin, RP_NAME } from './passkey.config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';

export interface PasskeySummary {
  id: number;
  label: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  backedUp: boolean;
}

@Injectable()
export class PasskeyService {
  constructor(
    @InjectRepository(Passkey)
    private readonly passkeys: Repository<Passkey>,
    private readonly challenges: ChallengeStore,
    private readonly usersService: UsersService,
  ) {}

  async listForUser(userId: number): Promise<PasskeySummary[]> {
    const rows = await this.passkeys.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(({ id, label, createdAt, lastUsedAt, backedUp }) => ({
      id,
      label,
      createdAt,
      lastUsedAt,
      backedUp,
    }));
  }

  async remove(userId: number, passkeyId: number): Promise<void> {
    // Scoped by userId so one user can't delete another's credential by id.
    const result = await this.passkeys.delete({ id: passkeyId, userId });
    if (!result.affected) throw new NotFoundException('Nie znaleziono klucza.');
  }

  // ---------------------------------------------------------------- register

  async startRegistration(user: { id: number; email: string; name?: string }) {
    const existing = await this.passkeys.find({ where: { userId: user.id } });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: getRpId(),
      userName: user.email,
      userDisplayName: user.name || user.email,
      // Stops the same device silently registering twice, which would leave
      // the user with duplicate entries they can't tell apart.
      excludeCredentials: existing.map((p) => ({
        id: p.credentialId,
        transports: p.transports as never,
      })),
      authenticatorSelection: {
        // 'required' is what makes it a *discoverable* credential, which is
        // what allows signing in without typing an email first.
        residentKey: 'required',
        userVerification: 'preferred',
      },
      // 'none' avoids asking for attestation we have no use for and which
      // triggers an extra consent prompt on some platforms.
      attestationType: 'none',
    });

    const handle = this.challenges.create(options.challenge, user.id);
    return { handle, options };
  }

  async finishRegistration(
    user: { id: number },
    handle: string,
    response: RegistrationResponseJSON,
    label: string,
  ): Promise<PasskeySummary> {
    const pending = this.challenges.consume(handle);
    if (!pending || pending.userId !== user.id) {
      throw new BadRequestException(
        'Sesja rejestracji wygasła. Spróbuj ponownie.',
      );
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: getRpOrigin(),
      expectedRPID: getRpId(),
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Nie udało się zweryfikować klucza.');
    }

    const { credential, credentialBackedUp } = verification.registrationInfo;

    const saved = await this.passkeys.save(
      this.passkeys.create({
        userId: user.id,
        credentialId: credential.id,
        // Uint8Array -> base64url for storage; converted back on verify.
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: (credential.transports ?? []) as string[],
        label: label?.trim() || 'Klucz dostępu',
        backedUp: credentialBackedUp,
      }),
    );

    return {
      id: saved.id,
      label: saved.label,
      createdAt: saved.createdAt,
      lastUsedAt: saved.lastUsedAt,
      backedUp: saved.backedUp,
    };
  }

  // ------------------------------------------------------------ authenticate

  /**
   * No username needed: with discoverable credentials the authenticator itself
   * offers the accounts it holds, so the user taps Face ID and we learn who
   * they are from the credential id in the response.
   */
  async startAuthentication() {
    const options = await generateAuthenticationOptions({
      rpID: getRpId(),
      userVerification: 'preferred',
      // Deliberately empty: listing credentials here would leak which accounts
      // exist to anyone hitting this endpoint.
      allowCredentials: [],
    });
    const handle = this.challenges.create(options.challenge);
    return { handle, options };
  }

  async finishAuthentication(
    handle: string,
    response: AuthenticationResponseJSON,
  ): Promise<User> {
    const pending = this.challenges.consume(handle);
    if (!pending) {
      throw new UnauthorizedException(
        'Sesja logowania wygasła. Spróbuj ponownie.',
      );
    }

    const stored = await this.passkeys.findOne({
      where: { credentialId: response.id },
    });
    if (!stored) throw new UnauthorizedException('Nieznany klucz dostępu.');

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: getRpOrigin(),
      expectedRPID: getRpId(),
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(Buffer.from(stored.publicKey, 'base64url')),
        counter: stored.counter,
        transports: stored.transports as never,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      throw new UnauthorizedException('Weryfikacja klucza nie powiodła się.');
    }

    // Synced passkeys report a counter of 0 forever, so this is recorded for
    // reference rather than enforced — rejecting a non-increasing counter
    // would lock out every iCloud and Google passkey.
    stored.counter = verification.authenticationInfo.newCounter;
    stored.lastUsedAt = new Date();
    await this.passkeys.save(stored);

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException(
        'Konto powiązane z kluczem nie istnieje.',
      );
    }

    // Must be persisted, not just omitted from the token: JwtStrategy re-reads
    // this from the database on every request, so a flag left set would bounce
    // the user straight back to the change-password screen. Same reasoning as
    // the Google path — registering a passkey required an authenticated
    // session in the first place.
    if (user.mustChangePassword) {
      await this.usersService.clearPasswordChangeRequirement(user.id);
      user.mustChangePassword = false;
    }
    return user;
  }
}
