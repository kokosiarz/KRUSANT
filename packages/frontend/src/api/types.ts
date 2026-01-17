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
  teacherId?: number | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
