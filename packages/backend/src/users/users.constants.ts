/** How long an admin-issued temporary password stays usable. */
export const TEMP_PASSWORD_TTL_MS = 24 * 60 * 60 * 1000;

export const TEMP_PASSWORD_LENGTH = 12;

/**
 * Deliberately excludes 0/O/o, 1/l/I and similar look-alikes: these passwords
 * get read off a screen and typed by hand, and a confusable character turns
 * into a support request.
 */
export const TEMP_PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Minimum length we accept when a user picks their own password. */
export const MIN_PASSWORD_LENGTH = 10;
