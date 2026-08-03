import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_PASSWORD_KEY = 'allowPendingPassword';

/**
 * Marks a route as reachable while the caller still owes a password change —
 * i.e. the routes needed to actually perform one (profile, logout, the change
 * itself). Everything else is blocked by ForcePasswordChangeGuard.
 */
export const AllowPendingPassword = () =>
  SetMetadata(ALLOW_PENDING_PASSWORD_KEY, true);
