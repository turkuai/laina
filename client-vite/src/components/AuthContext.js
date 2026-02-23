import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, verify JWT token from httpOnly cookie
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/users/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const safeUser = {
            id: data.user.id,
            username: data.user.username,
            name: data.user.displayName,
            role: data.user.role
          };
          setIsAuthenticated(true);
          setCurrentUser(safeUser);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login function - now with rememberMe parameter for httpOnly cookie
  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/users/login', {
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

      // Backend returns { success, message, user }
      const safeUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.displayName,
        role: data.user.role
      };

      setIsAuthenticated(true);
      setCurrentUser(safeUser);

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
      await fetch('/api/users/logout', {
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, loading }}>
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
