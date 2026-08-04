/**
 * Relying Party configuration — the single most common source of "passkeys
 * mysteriously don't work" bugs.
 *
 * Two values must be exactly right or the browser refuses silently-ish:
 *
 *  - `rpID` is a **bare domain**, no scheme and no port. `example.com`, never
 *    `https://example.com:443`. A credential is bound to it permanently, so
 *    changing it later invalidates every existing passkey.
 *  - `expectedOrigin` is the **full origin** the page was served from, scheme
 *    and port included, and must match the browser's origin exactly.
 *
 * Both are derived from FRONTEND_URL so there is one place to get it wrong
 * instead of three.
 */
export function getRpOrigin(): string {
  return process.env.FRONTEND_URL || 'http://localhost:3001';
}

export function getRpId(): string {
  // WEBAUTHN_RP_ID exists as an escape hatch: if the app is ever served from
  // several subdomains, rpID has to be the shared parent (`example.com` covers
  // `app.example.com`), which can't be derived from a single origin.
  if (process.env.WEBAUTHN_RP_ID) return process.env.WEBAUTHN_RP_ID;
  try {
    return new URL(getRpOrigin()).hostname;
  } catch {
    return 'localhost';
  }
}

export const RP_NAME = 'KRUSANT';

/** How long a challenge stays valid. Long enough for Face ID, short enough to matter. */
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
