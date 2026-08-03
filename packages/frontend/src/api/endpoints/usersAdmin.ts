import api from '../client';

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  roles: string[];
  studentId?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * No password field: the server generates a temporary one and emails it. See
 * IssuedCredentials for what comes back.
 */
export interface CreateUserRequest {
  email: string;
  name?: string;
  roles?: string[];
  studentId?: number | null;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string | null;
  roles?: string[];
  studentId?: number | null;
}

/**
 * Result of creating a user or issuing a fresh temporary password.
 * `tempPassword` is populated **only when the email failed** — it's the admin's
 * fallback for passing the password on by hand, and the one and only time it
 * can be read.
 */
export interface IssuedCredentials {
  user: AdminUser;
  emailSent: boolean;
  emailError: string | null;
  tempPasswordExpiresAt: string;
  tempPassword: string | null;
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
  createUser: async (data: CreateUserRequest): Promise<IssuedCredentials> => {
    return api.post<IssuedCredentials>('/users', data);
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (userId: number, data: UpdateUserRequest): Promise<AdminUser> => {
    return api.patch<AdminUser>(`/users/${userId}`, data);
  },

  /**
   * Issue a fresh temporary password and email it (admin only). Takes no body —
   * the admin doesn't choose the password. Also the way back in for a user
   * whose previous temporary password expired.
   */
  resetPassword: async (userId: number): Promise<IssuedCredentials> => {
    return api.post<IssuedCredentials>(`/users/${userId}/reset-password`);
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/users/${userId}`);
  },
};
