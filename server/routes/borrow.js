import express from 'express';
import db from '../db/borrow.js';

const router = express.Router();

router.post('/', (req, res) => {
  db.insertBorrow(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(201).json(result);
  });
});

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  db.selectBorrows(page, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json(result);
  });
});

router.get('/:id', (req, res) => {
  db.selectBorrowById(req.params.id, (err, record) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (!record) return res.status(404).json({ error: 'Borrow record not found' });
    res.json(record);
  });
});

router.patch('/:id', (req, res) => {
  db.updateBorrow(req.params.id, req.body, (err, success) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (!success) return res.status(404).json({ error: 'Borrow record not found' });
    res.json({ message: 'Borrow record updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  db.deleteBorrow(req.params.id, (err, success) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (!success) return res.status(404).json({ error: 'Borrow record not found' });
    res.json({ message: 'Borrow record deleted successfully' });
  });
});

export default router;
