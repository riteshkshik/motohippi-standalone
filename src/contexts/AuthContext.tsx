import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetMyProfile } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react/custom-fetch';

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('motohippi_token'));

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('motohippi_token'));
  }, []);

  const { data: user, isLoading, error } = useGetMyProfile({
    query: {
      enabled: !!token,
      queryKey: ['/api/users/me'],
      retry: false
    }
  });

  const login = (newToken: string) => {
    localStorage.setItem('motohippi_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('motohippi_token');
    setToken(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading: !!token && isLoading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
