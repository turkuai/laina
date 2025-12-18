import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "../db/borrowing-history.js";

dotenv.config();
const router = express.Router();

// Middleware to verify JWT (from cookies or headers)
function verifyToken(req, res, next) {
  const token =
    req.cookies?.authToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
}

router.use(cookieParser());

// CREATE - Protected
router.post("/", verifyToken, (req, res) => {
  db.insertBorrowHistory(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });

    db.selectBorrowHistoryById(id, (err2, newRecord) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newRecord);
    });
  });
});

// READ (paginated) - Protected
router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const borrowerId = req.query.borrower_id;

  if (borrowerId) {
    db.selectBorrowHistoryByBorrower(borrowerId, page, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  } else {
    db.selectBorrowHistory(page, (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    });
  }
});

// READ single record - Protected
router.get("/:id", verifyToken, (req, res) => {
  db.selectBorrowHistoryById(req.params.id, (err, record) => {
    if (err) return res.status(500).json({ error: err });
    if (!record)
      return res.status(404).json({ message: "Borrow record not found" });
    res.json(record);
  });
});

// UPDATE - Protected
router.patch("/:id", verifyToken, (req, res) => {
  const borrowData = { ...req.body, id: req.params.id };

  db.updateBorrowHistory(borrowData, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected)
      return res.status(404).json({ message: "Borrow record not found" });

    db.selectBorrowHistoryById(req.params.id, (err2, updatedRecord) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json(updatedRecord);
    });
  });
});

// DELETE - Protected
router.delete("/:id", verifyToken, (req, res) => {
  db.deleteBorrowHistory(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected)
      return res.status(404).json({ message: "Borrow record not found" });
    res.json({ message: "Borrow record deleted" });
  });
});

export default router;
