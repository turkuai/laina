import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'borrowing_system_current_user';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // On first load, try to restore user from localStorage OR sessionStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Login function - remember flag tells server to set httpOnly cookie with JWT
  const login = async (username, password, remember = false) => {
    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: allows cookies to be sent/received
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Invalid username or password' 
        };
      }

      // Backend returns { message, user } and sets httpOnly cookie if remember=true
      const safeUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.displayName,
        role: data.user.role
      };

      setIsAuthenticated(true);
      setCurrentUser(safeUser);

      // Use localStorage for persistent login, sessionStorage for session-only
      if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        sessionStorage.removeItem(STORAGE_KEY); // Clear session storage if exists
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        localStorage.removeItem(STORAGE_KEY); // Clear localStorage if exists
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please try again.' 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Call logout endpoint to clear httpOnly cookie
    fetch('/users/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('Logout error:', err));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
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