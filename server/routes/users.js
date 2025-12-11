import express from "express";
import db from "../db/users.js";

const router = express.Router();

// CREATE
router.post("/", (req, res) => {
  db.insertUser(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err });

    db.selectUserById(id, (err2, newUser) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(201).json(newUser);
    });
  });
});

// READ (paginated)
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectUsers(page, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// READ single
router.get("/:id", (req, res) => {
  db.selectUserById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: err });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });
});

// UPDATE
router.patch("/:id", (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  db.updateUser(id, fields, (err, updatedUser) => {
    if (err) return res.status(500).json({ error: err });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.deleteUser(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });
});

export default router;
