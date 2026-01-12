import express from "express";
import db from "../db/product-types.js";

const router = express.Router();

// CREATE - Add product type
router.post("/", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  db.insertProductType(name, description || "", (err, newType) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json(newType);
  });
});

// READ - All product types (paginated)
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectProductTypes(page, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// READ - Single product type
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.selectProductTypeById(id, (err, type) => {
    if (err) return res.status(500).json({ error: err });
    if (!type) return res.status(404).json({ error: "Product type not found" });
    res.json(type);
  });
});

// UPDATE - Edit product type
router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  db.selectProductTypeById(id, (err, existing) => {
    if (err) return res.status(500).json({ error: err });
    if (!existing)
      return res.status(404).json({ error: "Product type not found" });

    const updatedFields = {
      name: name ?? existing.name,
      description: description ?? existing.description,
    };

    db.updateProductType(id, updatedFields, (err2, updated) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json(updated);
    });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.deleteProductType(id, (err, success) => {
    if (err) return res.status(500).json({ error: err });
    if (!success)
      return res.status(404).json({ error: "Product type not found" });
    res.status(204).send();
  });
});

export default router;
