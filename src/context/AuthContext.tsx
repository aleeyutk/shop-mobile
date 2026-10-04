import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockLogin, fetchMe, logout as apiLogout } from '../api/auth';
import { getStoredToken, setStoredToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = await getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        const me = await fetchMe();
        setUser(me);
      }
    } catch (e) {
      console.warn('Auto-login failed, clearing token:', e);
      await setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, name?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedUser = await mockLogin(email, name);
      setUser(loggedUser);
      if (loggedUser.token) {
        setToken(loggedUser.token);
      }
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
