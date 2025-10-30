import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
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
      setIsAuthenticated(true);
      setCurrentUser({ 
        id: user.id, 
        username: user.username, 
        name: user.name,
        role: user.role 
      });
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
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