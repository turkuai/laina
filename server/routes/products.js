import express from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/products.js';

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
        const id = await db.insertProduct(req.body);
        const newProduct = await db.selectProductById(id);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ (paginated) - Protected
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await db.selectProducts(page, 20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single - Protected
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const product = await db.selectProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE - Protected
router.patch('/:id', verifyToken, async (req, res) => {
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

// DELETE (soft delete) - Protected
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const affected = await db.deleteProduct(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
