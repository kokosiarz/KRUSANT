import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CHALLENGE_TTL_MS } from './passkey.config';

/**
 * Short-lived store for in-flight WebAuthn challenges.
 *
 * A challenge is issued in the "options" call and must be checked against the
 * signed response in the "verify" call — it exists purely to stop a captured
 * response being replayed, so it has to be single-use and time-limited.
 *
 * In memory on purpose: the app runs as one pm2 process, and a challenge is
 * worthless after ~5 minutes. The cost of a restart is that anyone mid-Face-ID
 * has to press the button again. **If this app is ever run as more than one
 * instance, this has to move to the database or Redis** — otherwise the verify
 * request can land on a process that never issued the challenge, and every
 * other login fails.
 */
@Injectable()
export class ChallengeStore {
  private readonly entries = new Map<
    string,
    { challenge: string; userId?: number; expiresAt: number }
  >();

  /** Returns an opaque handle the client sends back with the response. */
  create(challenge: string, userId?: number): string {
    this.sweep();
    const handle = randomBytes(24).toString('base64url');
    this.entries.set(handle, {
      challenge,
      userId,
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    });
    return handle;
  }

  /** Single-use: consuming removes it, so a response can't be replayed. */
  consume(handle: string): { challenge: string; userId?: number } | null {
    this.sweep();
    const entry = this.entries.get(handle);
    if (!entry) return null;
    this.entries.delete(handle);
    if (entry.expiresAt < Date.now()) return null;
    return { challenge: entry.challenge, userId: entry.userId };
  }

  private sweep(): void {
    const now = Date.now();
    for (const [handle, entry] of this.entries) {
      if (entry.expiresAt < now) this.entries.delete(handle);
    }
  }
}
