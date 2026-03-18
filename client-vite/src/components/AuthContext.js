import { createContext, useContext, useState, useEffect } from 'react';
import { getApiBase } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchVerify = async () => {
    const res = await fetch(`${getApiBase()}/api/users/verify`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    setEmailVerified(!!data.email_verified);
    return data;
  };

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchVerify();
        if (data?.user) {
          setCurrentUser({
            id: data.user.id,
            username: data.user.username,
            name: data.user.displayName,
            role: data.user.role,
          });
          setIsAuthenticated(true);
          setEmailVerified(!!data.email_verified);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setEmailVerified(true);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Login function - now with rememberMe parameter for httpOnly cookie
  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await fetch(`${getApiBase()}/api/users/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Invalid username or password' 
        };
      }

      const safeUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.displayName,
        role: data.user.role
      };

      setIsAuthenticated(true);
      setCurrentUser(safeUser);
      setEmailVerified(!!data.email_verified);

      // httpOnly cookie is automatically set by the server
      // No client-side storage needed

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please try again.' 
      };
    }
  };

  // Logout function - clear httpOnly cookie on server
  const logout = async () => {
    try {
      await fetch(`${getApiBase()}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const resendVerification = async () => {
    await fetch(`${getApiBase()}/api/users/resend-verification`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, emailVerified, login, logout, loading, fetchVerify, resendVerification }}>
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
