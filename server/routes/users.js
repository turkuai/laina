import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "../db/users.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY_SHORT = "1h";
const JWT_EXPIRY_LONG = "30d";

router.use(cookieParser());

// Middleware to verify JWT from httpOnly cookie
export function verifyToken(req, res, next) {
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

// CREATE (Protected)
router.post("/", verifyToken, (req, res) => {
  db.insertUser(req.body, (err, newUser) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json(newUser);
  });
});

// LOGIN - Generate JWT token and set httpOnly cookie
router.post("/login", (req, res) => {
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Username and password are required" });
  }

  // Verify the user credentials
  db.verifyUser(username, password, (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    // Create JWT token
    const tokenExpiry = rememberMe ? JWT_EXPIRY_LONG : JWT_EXPIRY_SHORT;
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Set httpOnly cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
      path: "/",
    });

    return res.json({ success: true, message: "Login successful", user });
  });
});

// LOGOUT - Clear httpOnly cookie
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return res.json({ success: true, message: "Logged out successfully" });
});

// VERIFY TOKEN - Check if user is authenticated via httpOnly cookie
router.get("/verify", verifyToken, (req, res) => {
  db.selectUserById(req.user.id, (err, user) => {
    if (err)
      return res.status(500).json({ success: false, error: "Server error" });
    if (!user)
      return res.status(401).json({ success: false, error: "User not found" });

    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.first_name + " " + user.last_name,
      role: user.role,
    };

    return res.json({ success: true, user: safeUser });
  });
});

// READ (paginated)
router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;

  db.selectUsers(page, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// READ single
router.get("/:id", verifyToken, (req, res) => {
  db.selectUserById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: err });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });
});

// UPDATE
router.patch("/:id", verifyToken, (req, res) => {
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
router.delete("/:id", verifyToken, (req, res) => {
  db.deleteUser(req.params.id, (err, affected) => {
    if (err) return res.status(500).json({ error: err });
    if (!affected) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });
});

export default router;
