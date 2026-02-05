import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, API_BASE_URL, setOnUnauthorized } from '../lib/api';
import { DEV_CONFIG } from '../config/dev';

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_CONFIG.BYPASS_AUTH);
  const [isLoading, setIsLoading] = useState(!DEV_CONFIG.BYPASS_AUTH);
  const [user, setUser] = useState<User | null>(DEV_CONFIG.BYPASS_AUTH ? DEV_CONFIG.MOCK_USER : null);

  const checkAuth = useCallback(async () => {
    // Skip auth check in dev mode
    if (DEV_CONFIG.BYPASS_AUTH) {
      setIsAuthenticated(true);
      setUser(DEV_CONFIG.MOCK_USER);
      return;
    }

    try {
      const data = await api<AuthStatusResponse>('/api/auth/status');
      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Clear auth state on any 401 from API calls
  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  }, []);

  // Validate session on mount
  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false));
  }, [checkAuth]);

  // Listen for messages from auth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'AUTH_SUCCESS') {
        checkAuth();
      } else if (event.data?.type === 'AUTH_ERROR') {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkAuth]);

  const login = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${API_BASE_URL}/oauth2/authorization/google`,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );

    if (!popup) {
      console.error('Popup was blocked. Please allow popups for this site.');
      return;
    }

    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
      }
    }, 500);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Best-effort logout
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        login,
        logout,
        checkAuth,
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
