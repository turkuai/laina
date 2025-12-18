import db from "./db.js";
import bcrypt from "bcrypt";

// CREATE — insert a new user (hash password before saving)
function insertUser(userData, callback) {
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    phone_number,
  } = userData;

  // Hash password before inserting
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);

    db.query(
      "INSERT INTO users (username, first_name, last_name, email, password, role, phone_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        username,
        first_name,
        last_name,
        email,
        hashedPassword,
        role || "student",
        phone_number || null,
      ],
      (err2, result) => {
        if (err2) return callback(err2);
        callback(null, {
          id: result.insertId,
          username,
          first_name,
          last_name,
          email,
          role,
          phone_number,
        });
      }
    );
  });
}

// READ — get all users with pagination
function selectUsers(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS count FROM users", (err, countResult) => {
    if (err) return callback(err);

    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    db.query(
      "SELECT id, username, first_name, last_name, email, role, phone_number, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err2, rows) => {
        if (err2) return callback(err2);
        callback(null, {
          data: rows,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            limit,
          },
        });
      }
    );
  });
}

// READ — get single user by ID
function selectUserById(id, callback) {
  db.query(
    "SELECT id, username, first_name, last_name, email, role, phone_number, created_at FROM users WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0] || null);
    }
  );
}

// VERIFY USER — check username + password (used for login)
function verifyUser(username, password, callback) {
  db.query(
    "SELECT id, username, password, first_name, last_name, role FROM users WHERE username = ?",
    [username],
    (err, rows) => {
      if (err) return callback(err);
      if (rows.length === 0) return callback(null, null); // No user found

      const user = rows[0];

      // Compare hashed password with entered password
      bcrypt.compare(password, user.password, (err2, isMatch) => {
        if (err2) return callback(err2);
        if (!isMatch) return callback(null, null);

        // Return user info without password
        callback(null, {
          id: user.id,
          username: user.username,
          displayName: `${user.first_name} ${user.last_name}`,
          role: user.role,
        });
      });
    }
  );
}

// UPDATE — modify an existing user (rehash password if changed)
function updateUser(id, fields, callback) {
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    phone_number,
  } = fields;

  // If password provided, hash it first
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);

      db.query(
        "UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, role = ?, phone_number = ? WHERE id = ?",
        [
          username,
          first_name,
          last_name,
          email,
          hashedPassword,
          role,
          phone_number,
          id,
        ],
        (err2) => {
          if (err2) return callback(err2);

          selectUserById(id, (err3, updatedUser) => {
            if (err3) return callback(err3);
            callback(null, updatedUser);
          });
        }
      );
    });
  } else {
    // No password change
    db.query(
      "UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, role = ?, phone_number = ? WHERE id = ?",
      [username, first_name, last_name, email, role, phone_number, id],
      (err, result) => {
        if (err) return callback(err);

        selectUserById(id, (err2, updatedUser) => {
          if (err2) return callback(err2);
          callback(null, updatedUser);
        });
      }
    );
  }
}

// DELETE — remove a user
function deleteUser(id, callback) {
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows > 0);
  });
}

// Export
const users = {
  insertUser,
  selectUsers,
  selectUserById,
  verifyUser,
  updateUser,
  deleteUser,
};

export default users;
