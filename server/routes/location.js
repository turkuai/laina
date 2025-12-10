// server/routes/location.js
import express from 'express';
import db from '../db/db.js';

const router = express.Router();

// GET all locations
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, location_name, description, created_at FROM locations ORDER BY location_name ASC'
    );
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

// GET single location
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, location_name, description, created_at FROM locations WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create new location
router.post('/', async (req, res, next) => {
  try {
    const { location_name, description } = req.body;
    if (!location_name) {
      return res.status(400).json({ error: 'location_name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO locations (location_name, description) VALUES (?, ?)',
      [location_name, description || null]
    );

    const [created] = await db.query(
      'SELECT id, location_name, description, created_at FROM locations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
