import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import usersData from '../data/users.json';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (requiredRole: string) => boolean;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('igac_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        const user = usersData.users.find(u => u.email === parsed.email);
        if (user) {
          setAuthState({
            isAuthenticated: true,
            currentUser: user,
          });
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('igac_auth');
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = usersData.users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      setAuthState({
        isAuthenticated: true,
        currentUser: user,
      });
      localStorage.setItem('igac_auth', JSON.stringify({ email: user.email }));
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
    });
    localStorage.removeItem('igac_auth');
  };

  const hasPermission = (requiredRole: string): boolean => {
    const roleHierarchy = {
      root: 4,
      admin: 3,
      recognizer: 2,
      viewer: 1
    };

    const userRole = authState.currentUser?.role || 'viewer';
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >=
           roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
    users: usersData.users,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}