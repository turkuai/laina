import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'borrowing_system_current_user';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setCurrentUser(user);
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const login = async (username, password, remember = false) => {
        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            if (!data.user) {
                return { success: false, error: 'No user data received' };
            }

            // Create safe user object with correct field mapping
            const safeUser = {
                id: data.user.id,
                username: data.user.username,
                name: `${data.user.first_name} ${data.user.last_name}`,
                role: data.user.role
            };

            setIsAuthenticated(true);
            setCurrentUser(safeUser);

            if (remember) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error or server unavailable' };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
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
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

