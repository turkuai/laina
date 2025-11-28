const express = require('express');
const router = express.Router();

const {
  insertProductType,
  selectProductTypes,
  selectProductTypeById,
  updateProductType,
  deleteProductType,
} = require('../db/product-types');

// POST /api/product-types
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newType = await insertProductType(name, description || '');
    res.status(201).json(newType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/product-types?page=1
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await selectProductTypes(page);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/product-types/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const type = await selectProductTypeById(id);
    if (!type) {
      return res.status(404).json({ error: 'Product type not found' });
    }
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/product-types/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    const existing = await selectProductTypeById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const updated = await updateProductType(id, {
      name: name ?? existing.name,
      description: description ?? existing.description,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/product-types/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await deleteProductType(id);
    if (!success) {
      return res.status(404).json({ error: 'Product type not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;