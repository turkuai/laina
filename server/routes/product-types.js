// server/routes/product-types.js
import express from 'express';
import db from '../db/db.js';

const router = express.Router();

// GET all device types
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, type_name, created_at FROM device_types ORDER BY type_name ASC'
    );
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

// GET single device type
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, type_name, created_at FROM device_types WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create new device type
router.post('/', async (req, res, next) => {
  try {
    const { type_name } = req.body;
    if (!type_name) {
      return res.status(400).json({ error: 'type_name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO device_types (type_name) VALUES (?)',
      [type_name]
    );

    const [created] = await db.query(
      'SELECT id, type_name, created_at FROM device_types WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
