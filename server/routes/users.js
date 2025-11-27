// server/routes/user.js:

import express from "express";
const router = express.Router();
import db from '../db/users.js'; // Renamed to 'db' for brevity, but refers to 'server/db/user.js'

// ... existing CREATE route ...

// LOGIN (New Route for Authentication)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Use the new function to verify user and password
        // This will now work against the database
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

// ... existing READ, UPDATE, DELETE routes ...

export default router;