import express from "express";
import db from "../db/users.js";
import jwt from "jsonwebtoken";
const router = express.Router();

// JWT Secret - In production, use environment variable!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to authenticate token from cookie
function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// CREATE
router.post("/", (req, res) => {
  db.insertUser(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });

    db.selectUserById(id, (err2, newUser) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newUser);
    });
  });
});

// LOGIN with JWT and httpOnly cookie support
router.post('/login', async (req, res) => {
    try {
        const { username, password, remember } = req.body;
        
        const user = await db.verifyUser(username, password); 

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create JWT token (always, even without remember me)
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: remember ? '30d' : '1d' } // 30 days if remember, 1 day for session
        );

        // Set httpOnly cookie with JWT
        // If remember=true: 30 days (persistent cookie)
        // If remember=false: NO maxAge = session cookie (cleared on browser close)
        const cookieOptions = {
            httpOnly: true,      // Cannot be accessed by JavaScript
            secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
            sameSite: 'strict',  // CSRF protection
        };

        // Only add maxAge if remember is true - otherwise it's a session cookie
        if (remember) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.cookie('auth_token', token, cookieOptions);

        // Return user data to client
        res.json({ 
            message: 'Login successful', 
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                role: user.role
            }
        });
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

// VERIFY TOKEN - Check if user is authenticated via cookie
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        // Fetch fresh user data from database
        const user = await db.selectUserById(req.user.id);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.json({ 
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying user' });
    }
});

// READ (paginated)
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectUsers(page, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// READ single
router.get("/:id", (req, res) => {
  db.selectUserById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: err });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });
});

// UPDATE
router.patch("/:id", (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  db.updateUser(id, fields, (err, updatedUser) => {
    if (err) return res.status(500).json({ error: err });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.deleteUser(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });
});

export default router;
