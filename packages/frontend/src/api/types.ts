// API Request and Response Types

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string; // Optional if using httpOnly cookies
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  studentId?: number | null;
  /**
   * The account is on an admin-issued temporary password. Until it's changed
   * the backend rejects every request except profile/logout/change-password,
   * so the UI must show nothing but the change-password screen.
   */
  mustChangePassword?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
