import api from '../client';

export interface AdminUser {
  id: number;
  email: string;
  roles: string[];
  teacherId?: number | null;
  studentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roles?: string[];
  teacherId?: number | null;
  studentId?: number | null;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  roles?: string[];
  teacherId?: number | null;
  studentId?: number | null;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

/**
 * Admin user management API endpoints
 */
export const usersAdminApi = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: async (): Promise<AdminUser[]> => {
    return api.get<AdminUser[]>('/users');
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (userId: number): Promise<AdminUser> => {
    return api.get<AdminUser>(`/users/${userId}`);
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<AdminUser> => {
    return api.post<AdminUser>('/users', data);
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (userId: number, data: UpdateUserRequest): Promise<AdminUser> => {
    return api.patch<AdminUser>(`/users/${userId}`, data);
  },

  /**
   * Reset user password (admin only)
   */
  resetPassword: async (userId: number, data: ResetPasswordRequest): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/users/${userId}/reset-password`, data);
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/users/${userId}`);
  },
};
