// server/routes/product-types.js
import express from 'express';
import db from '../db/db.js';

const router = express.Router();

// GET all device types
router.get('/', async (req, res, next) => {
  try {
    const promisePool = db.promise();
    const [rows] = await promisePool.query(
      'SELECT id, type_name, created_at FROM device_types ORDER BY type_name ASC'
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Error fetching device types:', err);
    next(err);
  }
});

// GET single device type
router.get('/:id', async (req, res, next) => {
  try {
    const promisePool = db.promise();
    const [rows] = await promisePool.query(
      'SELECT id, type_name, created_at FROM device_types WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching device type:', err);
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

    const promisePool = db.promise();
    const [result] = await promisePool.query(
      'INSERT INTO device_types (type_name) VALUES (?)',
      [type_name]
    );

    const [created] = await promisePool.query(
      'SELECT id, type_name, created_at FROM device_types WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(created[0]);
  } catch (err) {
    console.error('Error creating device type:', err);
    next(err);
  }
});

// PATCH - Edit device type
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { type_name } = req.body;

    if (!type_name) {
      return res.status(400).json({ error: 'type_name is required' });
    }

    const promisePool = db.promise();
    const [result] = await promisePool.query(
      'UPDATE device_types SET type_name = ? WHERE id = ?',
      [type_name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }

    const [updated] = await promisePool.query(
      'SELECT id, type_name, created_at FROM device_types WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating device type:', err);
    next(err);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const promisePool = db.promise();
    const [result] = await promisePool.query(
      'DELETE FROM device_types WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting device type:', err);
    next(err);
  }
});

export default router;
