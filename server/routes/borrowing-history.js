import express from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/borrowing-history.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT from httpOnly cookie
function verifyToken(req, res, next) {
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

// CREATE - Protected
router.post('/', verifyToken, async (req, res) => {
    try {
        const id = await db.insertBorrowHistory(req.body);
        const newRecord = await db.selectBorrowHistoryById(id);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ (paginated) - Protected
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const borrowerId = req.query.borrower_id;
        
        let data;
        if (borrowerId) {
            data = await db.selectBorrowHistoryByBorrower(borrowerId, page, 20);
        } else {
            data = await db.selectBorrowHistory(page, 20);
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single record - Protected
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const record = await db.selectBorrowHistoryById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE - Protected
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const borrowData = { ...req.body, id: req.params.id };
        const affected = await db.updateBorrowHistory(borrowData);
        
        if (!affected) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }
        
        const updatedRecord = await db.selectBorrowHistoryById(req.params.id);
        res.json(updatedRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE - Protected
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const affected = await db.deleteBorrowHistory(req.params.id);
        
        if (!affected) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }
        
        res.json({ message: 'Borrow record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
