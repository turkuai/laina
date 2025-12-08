import express from "express";
import db from "../db/borrowing-history.js";

const router = express.Router();

// CREATE - New borrow record
router.post("/", (req, res) => {
  db.insertBorrowHistory(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });
    db.selectBorrowHistoryById(id, (err2, newRecord) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newRecord);
    });
  });
});

// READ (paginated) - All history or filtered by borrower
router.get("/", (req, res) => {
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

// READ single record
router.get("/:id", (req, res) => {
  db.selectBorrowHistoryById(req.params.id, (err, record) => {
    if (err) return res.status(500).json({ error: err });
    if (!record)
      return res.status(404).json({ message: "Borrow record not found" });
    res.json(record);
  });
});

// UPDATE - Update return info or notes
router.patch("/:id", (req, res) => {
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

// DELETE
router.delete("/:id", (req, res) => {
  db.deleteBorrowHistory(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected)
      return res.status(404).json({ message: "Borrow record not found" });
    res.json({ message: "Borrow record deleted" });
  });
});

export default router;
