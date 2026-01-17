import api from '../client';
import { UpdateUserRequest, User } from '../types';

/**
 * User management API endpoints
 */

export const userApi = {
  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return api.get<User>(`/users/${userId}`);
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    return api.patch<User>('/users/me', data);
  },

  /**
   * Delete current user account
   */
  deleteAccount: async (): Promise<void> => {
    return api.delete<void>('/users/me');
  },
};
