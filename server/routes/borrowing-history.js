import express from "express";
import db from '../db/borrowing-history.js';

const router = express.Router();

// CREATE - New borrow record
router.post('/', async (req, res) => {
    try {
        const id = await db.insertBorrowHistory(req.body);
        const newRecord = await db.selectBorrowHistoryById(id);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ (paginated) - All history or filtered by borrower
router.get('/', async (req, res) => {
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

// READ single record
router.get('/:id', async (req, res) => {
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

// UPDATE - For updating return info or notes
router.patch('/:id', async (req, res) => {
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

// DELETE
router.delete('/:id', async (req, res) => {
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