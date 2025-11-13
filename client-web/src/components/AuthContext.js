import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// NEW: key for localStorage
const STORAGE_KEY = 'borrowing_system_current_user';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // NEW: on first load, try to restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // SMALL CHANGE: added optional "remember" param
  const login = (username, password, remember = false) => {
    const users = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
      { id: 2, username: 'mikko', password: 'pass123', role: 'student', name: 'Mikko' },
      { id: 3, username: 'ville', password: 'pass123', role: 'student', name: 'Ville' },
      { id: 4, username: 'sanna', password: 'pass123', role: 'teacher', name: 'Sanna' },
      { id: 5, username: 'aino', password: 'pass123', role: 'student', name: 'Aino' }
    ];

    const user = users.find(u => 
      u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
      u.password === password.trim()
    );
    
    if (user) {
      const safeUser = { 
        id: user.id, 
        username: user.username, 
        name: user.name,
        role: user.role 
      };

      setIsAuthenticated(true);
      setCurrentUser(safeUser);

      // NEW: if remember is checked, persist user; otherwise clear
      if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // NEW: also clear persisted user
    localStorage.removeItem(STORAGE_KEY);
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
