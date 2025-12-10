import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if user is authenticated via httpOnly cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/users/verify', {
          method: 'GET',
          credentials: 'include', // Send cookies with request
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setCurrentUser({
            id: data.user.id,
            username: data.user.username,
            name: data.user.displayName,
            role: data.user.role
          });
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function - remember flag tells server to set persistent httpOnly cookie
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

      // Backend returns { message, user } and sets httpOnly cookie
      const safeUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.displayName,
        role: data.user.role
      };

      setIsAuthenticated(true);
      setCurrentUser(safeUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await fetch('/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      login, 
      logout,
      loading 
    }}>
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
