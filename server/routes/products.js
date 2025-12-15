import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "../db/products.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

router.use(cookieParser());

// Middleware to verify JWT (from cookie or header)
function verifyToken(req, res, next) {
  const token =
    req.cookies?.authToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
}

// CREATE - Protected
router.post("/", verifyToken, (req, res) => {
  db.insertProduct(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });

    db.selectProductById(id, (err2, newProduct) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newProduct);
    });
  });
});

// READ (paginated) - Protected
router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectProducts(page, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// READ single - Protected
router.get("/:id", verifyToken, (req, res) => {
  db.selectProductById(req.params.id, (err, product) => {
    if (err) return res.status(500).json({ error: err });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });
});

// UPDATE - Protected
router.patch("/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  db.updateProduct(id, fields, (err, updatedProduct) => {
    if (err) return res.status(500).json({ error: err });
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  });
});

// DELETE - Protected
router.delete("/:id", verifyToken, (req, res) => {
  db.deleteProduct(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  });
});

export default router;
