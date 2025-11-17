import express from "express";
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../db/products.js";

const router = express.Router();

router.post('/', async function(req, res, next) {
  try {
    const required = ['device_type_id', 'product_name', 'purchase_date'];
    for (const k of required) {
      if (!(k in req.body)) {
        return res.status(400).json({ error: `Missing required field: ${k}` });
      }
    }

    const { id } = await createProduct(req.body);
    const created = await getProductById(id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    const { page, limit } = req.query;
    const data = await listProducts({ page, limit });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
    const { affectedRows } = await updateProduct(req.params.id, req.body || {});
    if (affectedRows === 0) return res.status(404).json({ error: 'Not found or no changes' });
    const updated = await getProductById(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    const { affectedRows } = await deleteProduct(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;