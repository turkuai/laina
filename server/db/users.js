import db from "./db.js";

// CREATE — insert a new user
function insertUser(userData, callback) {
  const { first_name, last_name, email, password, role } = userData;

  db.query(
    "INSERT INTO users (first_name, last_name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [first_name, last_name, email, password, role || "student"],
    (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId, ...userData });
    }
  );
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
      "SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return callback(err);
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
    "SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0] || null);
    }
  );
}

// UPDATE — modify an existing user
function updateUser(id, fields, callback) {
  const { first_name, last_name, email, password, role } = fields;

  db.query(
    "UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, role = ? WHERE id = ?",
    [first_name, last_name, email, password, role, id],
    (err, result) => {
      if (err) return callback(err);

      // Fetch updated record
      selectUserById(id, (err2, updatedUser) => {
        if (err2) return callback(err2);
        callback(null, updatedUser);
      });
    }
  );
}

// DELETE — remove a user
function deleteUser(id, callback) {
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows > 0);
  });
}

const users = {
  insertUser,
  selectUsers,
  selectUserById,
  updateUser,
  deleteUser,
};

export default users;
