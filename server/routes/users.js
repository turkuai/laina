import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
import db from '../db/users.js';

// JWT Secret - In production, use environment variable!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// CREATE
router.post('/', async (req, res) => {
    try {
        const id = await db.insertUser(req.body);
        const newUser = await db.selectUserById(id);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN with JWT and httpOnly cookie support
router.post('/login', async (req, res) => {
    try {
        const { username, password, remember } = req.body;
        
        const user = await db.verifyUser(username, password); 

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // If remember me is checked, create JWT and set httpOnly cookie
        if (remember) {
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: '30d' } // Token expires in 30 days
            );

            // Set httpOnly cookie with JWT
            res.cookie('auth_token', token, {
                httpOnly: true,      // Cannot be accessed by JavaScript
                secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
                sameSite: 'strict',  // CSRF protection
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
            });
        }

        // Return user data to client
        res.json({ message: 'Login successful', user });
    } catch (err) {
        console.error("Login route error:", err);
        res.status(500).json({ message: 'Server error during login process' });
    }
});

// LOGOUT - Clear the httpOnly cookie
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Logged out successfully' });
});

// VERIFY TOKEN - Optional endpoint to validate JWT from cookie
router.get('/verify', (req, res) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ message: 'No token found' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Optionally fetch fresh user data from database
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// READ (paginated)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await db.selectUsers(page, 20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single
router.get('/:id', async (req, res) => {
    try {
        const user = await db.selectUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE
router.patch('/:id', async (req, res) => {
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

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const affected = await db.deleteUser(req.params.id);
        if (!affected) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
