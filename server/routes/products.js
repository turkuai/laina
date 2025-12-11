import express from "express";
import db from "../db/products.js";

const router = express.Router();

// CREATE
router.post("/", (req, res) => {
  db.insertProduct(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });

    db.selectProductById(id, (err2, newProduct) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newProduct);
    });
  });
});

// READ (paginated)
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectProducts(page, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// READ single
router.get("/:id", (req, res) => {
  db.selectProductById(req.params.id, (err, product) => {
    if (err) return res.status(500).json({ error: err });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });
});

// UPDATE
router.patch("/:id", (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  db.updateProduct(id, fields, (err, updatedProduct) => {
    if (err) return res.status(500).json({ error: err });
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.deleteProduct(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  });
});

export default router;
