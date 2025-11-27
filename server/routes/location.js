import express from 'express';
import db from '../db/location.js';

const router = express.Router();

// GET /locations?page=1 - list locations with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  db.getLocations(page, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(result);
  });
});

// POST /locations - create new location
router.post('/', (req, res) => {
  const { location_name, description } = req.body;

  console.log("Received location_name:", location_name);
  console.log("Received description:", description);

  if (!location_name || !description) {
    return res.status(400).json({ error: 'location_name and description are required' });
  }

  db.addLocation(location_name, description, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(201).json(result);
  });
});

// PATCH /locations/:id - update location name
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const location_name = req.body.location_name;
  if (!location_name) {
    return res.status(400).json({ error: 'location_name is required' });
  }

  db.updateLocation(id, location_name, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(result);
  });
});

// DELETE /locations/:id - remove location
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.deleteLocation(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(result);
  });
});

export default router;
