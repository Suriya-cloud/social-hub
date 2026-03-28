import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';
import type { User } from '@/types/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, fullName: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const user = api.auth.login(username, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, fullName: string): Promise<User> => {
    try {
      const user = api.auth.register(username, password, fullName);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = api.auth.updateProfile(currentUser.id, updates);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
