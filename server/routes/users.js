import express from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const router = express.Router();
import db from '../db/users.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY_SHORT = '1h';
const JWT_EXPIRY_LONG = '30d';

// Middleware to verify JWT from httpOnly cookie
export function verifyToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

// CREATE (Protected - admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const id = await db.insertUser(req.body);
        const newUser = await db.selectUserById(id);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN - Generate JWT token and set httpOnly cookie
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        // Verify the user credentials
        const user = await db.verifyUser(username, password);

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        // Create JWT token
        const tokenExpiry = rememberMe ? JWT_EXPIRY_LONG : JWT_EXPIRY_SHORT;
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
        );

        // Set httpOnly cookie
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/'
        });

        return res.json({ success: true, message: 'Login successful', user });

    } catch (err) {
        console.error("Login route error:", err);
        return res.status(500).json({ success: false, error: 'Server error during login process' });
    }
});

// LOGOUT - Clear httpOnly cookie
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    return res.json({ success: true, message: 'Logged out successfully' });
});

// VERIFY TOKEN - Check if user is authenticated via httpOnly cookie
router.get('/verify', verifyToken, async (req, res) => {
    try {
        // req.user is set by verifyToken middleware
        const user = await db.selectUserById(req.user.id);
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        // Return user data without password
        const safeUser = {
            id: user.id,
            username: user.username,
            displayName: user.first_name + ' ' + user.last_name,
            role: user.role
        };

        return res.json({ success: true, user: safeUser });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// READ (paginated - Protected)
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await db.selectUsers(page, 20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single (Protected)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await db.selectUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE (Protected)
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const userData = { ...req.body, id: req.params.id };
        const affected = await db.updateUser(userData);
        if (!affected) return res.status(404).json({ message: 'User not found' });
        const updatedUser = await db.selectUserById(req.params.id);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const affected = await db.deleteUser(req.params.id);
        if (!affected) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
