import api from '../client';
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '../types';

/**
 * Authentication API endpoints
 * Uses httpOnly cookies for session management
 */

export const authApi = {
  /**
   * Login with email and password
   * Backend should set httpOnly cookie on successful login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * SELF-SIGNUP IS DISABLED — accounts are created by an admin on the Users
   * page. `POST /auth/register` does not exist on the backend, so calling this
   * will 404; it is kept, unused, as the client half of the signup flow should
   * it ever be turned back on (backend: ALLOW_SELF_SIGNUP in auth.service.ts).
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/register', data);
  },

  /**
   * Change own password. Also how a user clears an admin-issued temporary
   * password — on success `mustChangePassword` goes false and the rest of the
   * app unlocks.
   */
  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/change-password', data);
  },

  /**
   * Logout current user
   * Backend should clear the httpOnly cookie
   */
  logout: async (): Promise<void> => {
    return api.post<void>('/auth/logout');
  },

  /**
   * Get current authenticated user
   * Uses the httpOnly cookie to identify the user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.user;
  },

  /**
   * Refresh the authentication token/session
   * Backend should refresh the httpOnly cookie
   */
  refreshSession: async (): Promise<void> => {
    return api.post<void>('/auth/refresh');
  },
};
