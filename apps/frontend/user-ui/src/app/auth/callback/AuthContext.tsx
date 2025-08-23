'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // fix import without curly braces

type DecodedToken = {
  email?: string;
  exp?: number;
   userId?: string;
  // Add other fields your token contains if needed
};

type UserType = {
  token: string;
  email?: string;
  exp?: number;
  id?: string; 
};

type AuthContextType = {
  user: UserType | null;
  login: (userData: { token: string }) => void;
  logout: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // On mount, try to get user from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser({
            token,
            email: decoded.email,
            exp: decoded.exp,
                id: decoded.userId,  
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  // login receives an object with token string, decodes and sets user state
  const login = (userData: { token: string }) => {
    try {
      const decoded: DecodedToken = jwtDecode(userData.token);
      setUser({
        token: userData.token,
        email: decoded.email,
        exp: decoded.exp,
              id: decoded.userId,  
      });
      localStorage.setItem('token', userData.token);
    } catch {
      // handle invalid token if needed
      console.error('Invalid token during login');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  }), [user, isSidebarOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
