import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch {
      return { success: false, message: 'Failed to login' };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await api.register(username, email, password);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch {
      return { success: false, message: 'Failed to register' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
