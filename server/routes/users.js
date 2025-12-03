import express from "express";
const router = express.Router();
import db from '../db/users.js';

// CREATE
router.post('/', async (req, res) => {
    try {
        const id = await db.insertUser(req.body);
        const newUser = await db.selectUserById(id);
        res.status(201).json(newUser);
    } catch (err) {
        // You might want to check for unique constraint violations (e.g., duplicate username)
        res.status(500).json({ message: err.message });
    }
});

// LOGIN (New Route for Authentication)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // This function must be implemented in '../db/user.js' 
        // to verify the username and hashed password.
        const user = await db.verifyUser(username, password); 

        if (!user) {
            // Use 401 Unauthorized for failed credentials
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Authentication successful.
        // The client-side AuthContext expects an object with a 'user' property.
        res.json({ message: 'Login successful', user });
    } catch (err) {
        console.error("Login route error:", err);
        // Catch network or database errors
        res.status(500).json({ message: 'Server error during login process' });
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
