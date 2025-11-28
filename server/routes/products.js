import express from "express";
const router = express.Router();
import db from '../db/products.js';

// CREATE
router.post('/', async (req, res) => {
    try {
        const id = await db.insertProduct(req.body);
        const newProduct = await db.selectProductById(id);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ (paginated)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await db.selectProducts(page, 20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single
router.get('/:id', async (req, res) => {
    try {
        const product = await db.selectProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE
router.patch('/:id', async (req, res) => {
    try {
        const productData = { ...req.body, id: req.params.id };
        const affected = await db.updateProduct(productData);
        if (!affected) return res.status(404).json({ message: 'Product not found' });
        const updatedProduct = await db.selectProductById(req.params.id);
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const affected = await db.deleteProduct(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;