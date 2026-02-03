import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'smart_sip_auth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticatedState(true);
    }
    setIsLoading(false);
  }, []);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticatedState(value);
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // Listen for messages from auth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'AUTH_SUCCESS') {
        setAuthenticated(true);
      } else if (event.data?.type === 'AUTH_ERROR') {
        console.error('Authentication failed:', event.data.error);
        setAuthenticated(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setAuthenticated]);

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

    // Check if popup was blocked
    if (!popup) {
      console.error('Popup was blocked. Please allow popups for this site.');
      return;
    }

    // Poll to check if popup was closed without completing auth
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
      }
    }, 500);
  };

  const logout = () => {
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        login,
        logout,
        setAuthenticated,
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
