import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types';
import * as api from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.getMe();
      if (response.success) {
        setState({
          user: response.data,
          token,
          isAuthenticated: true
        });
      } else {
        localStorage.removeItem('token');
      }
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      setState({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true
      });
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.register({ username, email, password });
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      setState({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
