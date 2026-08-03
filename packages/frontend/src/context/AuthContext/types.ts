import React from 'react';
import { User, LoginRequest } from '../../api/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Signed in, but holding a temporary password that must be changed first. */
  mustChangePassword: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  // Self-signup is disabled; see authApi.register.
  // register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
