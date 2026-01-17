import React, { createContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/endpoints/auth';
import { ApiClientError } from '../../api/client';
import { LoginRequest, User } from '../../api/types';
import { AuthContextType, AuthProviderProps } from './types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    meta: {
      errorHandler: (error: any) => {
        if (error.statusCode !== 401) {
          console.error('Failed to fetch current user:', error);
        }
      },
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      setError(null);
    },
    onError: (error: ApiClientError) => setError(error.message),
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      setError(null);
    },
    onError: (error: ApiClientError) => setError(error.message),
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      setError(null);
    },
    onError: (error: ApiClientError) => setError(error.message),
  });

  const login = useCallback(async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refetchUserCallback = useCallback(async () => {
    await refetchUser();
  }, [refetchUser]);

  const value: AuthContextType = {
    user: (user as User | null) || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refetchUser: refetchUserCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
