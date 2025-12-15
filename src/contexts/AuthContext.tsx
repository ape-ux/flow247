import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { xano, XanoAuthResponse } from '@/lib/xano';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (xano.isAuthenticated()) {
        try {
          const userData = await xano.getMe();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          xano.clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await xano.login(email, password);
    if (response.user) {
      setUser(response.user);
    } else {
      const userData = await xano.getMe();
      if (userData) {
        setUser(userData);
      }
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await xano.signup(email, password, name);
    if (response.user) {
      setUser(response.user);
    } else {
      const userData = await xano.getMe();
      if (userData) {
        setUser(userData);
      }
    }
  };

  const logout = () => {
    xano.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
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
