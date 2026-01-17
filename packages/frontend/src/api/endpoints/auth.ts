import api from '../client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

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
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/register', data);
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
