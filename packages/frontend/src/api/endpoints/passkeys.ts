import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import api from '../client';
import { User } from '../types';

export interface PasskeySummary {
  id: number;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
  /** True for iCloud/Google-synced keys, i.e. available on their other devices. */
  backedUp: boolean;
}

/** False on old browsers and on plain-http origins, where WebAuthn is unavailable. */
export const passkeysSupported = (): boolean => browserSupportsWebAuthn();

export const passkeysApi = {
  list: async (): Promise<PasskeySummary[]> =>
    api.get<PasskeySummary[]>('/auth/passkey'),

  remove: async (id: number): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/auth/passkey/${id}`),

  /**
   * Registers a passkey for the signed-in user. Two round trips by design:
   * the server issues a challenge, the authenticator signs it, the server
   * verifies — the browser call in between is what triggers Face ID.
   */
  register: async (label: string): Promise<PasskeySummary> => {
    const { handle, options } = await api.post<{ handle: string; options: any }>(
      '/auth/passkey/register/options',
    );
    const response = await startRegistration({ optionsJSON: options });
    return api.post<PasskeySummary>('/auth/passkey/register/verify', {
      handle,
      response,
      label,
    });
  },

  /**
   * Signs in without a username: the authenticator offers whichever accounts
   * it holds for this site, so there is nothing to type.
   */
  login: async (): Promise<{ user: User }> => {
    const { handle, options } = await api.post<{ handle: string; options: any }>(
      '/auth/passkey/login/options',
    );
    const response = await startAuthentication({ optionsJSON: options });
    return api.post<{ user: User }>('/auth/passkey/login/verify', {
      handle,
      response,
    });
  },
};
