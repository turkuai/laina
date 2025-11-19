const express = require('express');
const router = express.Router();
const db = require('../db/users');

// CREATE
router.post('/', async (req, res) => {
    try {
        const id = await db.insertUser(req.body);
        const newUser = await db.selectUserById(id);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ (paginated)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await db.selectUsers(page, 20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// READ single
router.get('/:id', async (req, res) => {
    try {
        const user = await db.selectUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE
router.patch('/:id', async (req, res) => {
    try {
        const userData = { ...req.body, id: req.params.id };
        const affected = await db.updateUser(userData);
        if (!affected) return res.status(404).json({ message: 'User not found' });
        const updatedUser = await db.selectUserById(req.params.id);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const affected = await db.deleteUser(req.params.id);
        if (!affected) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
