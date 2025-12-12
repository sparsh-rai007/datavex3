'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from './api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Checks if the user has a valid token — NO REDIRECTS here.
   */
  const checkAuth = async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch {
      Cookies.remove('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ADMIN LOGIN ONLY
   */
  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    const userData = response.user;

    if (!userData) throw new Error("Login failed");

    setUser(userData);

    // Redirect ONLY after successful login
    if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      // Non-admin users are not allowed at all
      router.push("/");
    }
  };

  /**
   * LOGOUT
   */
  const logout = async () => {
    await apiClient.logout();
    Cookies.remove('accessToken');
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
