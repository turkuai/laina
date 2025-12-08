import db from "./db.js";

// CREATE — insert a new product type
function insertProductType(name, description, callback) {
  db.query(
    "INSERT INTO product_types (name, description) VALUES (?, ?)",
    [name, description],
    (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, { id: result.insertId, name, description });
    }
  );
}

// READ — get paginated list of product types
function selectProductTypes(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS count FROM product_types",
    (err, countResult) => {
      if (err) {
        return callback(err);
      }

      const total = countResult[0].count;
      const totalPages = Math.ceil(total / limit);

      db.query(
        "SELECT * FROM product_types ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
          if (err) {
            return callback(err);
          }
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
    }
  );
}

// READ — get a single product type by ID
function selectProductTypeById(id, callback) {
  db.query("SELECT * FROM product_types WHERE id = ?", [id], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows[0] || null);
  });
}

// UPDATE — modify an existing product type
function updateProductType(id, fields, callback) {
  const { name, description } = fields;

  db.query(
    "UPDATE product_types SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
    (err, result) => {
      if (err) {
        return callback(err);
      }

      // Fetch updated record
      selectProductTypeById(id, (err2, updatedType) => {
        if (err2) {
          return callback(err2);
        }
        callback(null, updatedType);
      });
    }
  );
}

// DELETE — remove a product type
function deleteProductType(id, callback) {
  db.query("DELETE FROM product_types WHERE id = ?", [id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result.affectedRows > 0);
  });
}

const productTypes = {
  insertProductType,
  selectProductTypes,
  selectProductTypeById,
  updateProductType,
  deleteProductType,
};

export default productTypes;
