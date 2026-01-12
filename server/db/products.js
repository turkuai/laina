import db from "./db.js";

// CREATE — insert a new product
function insertProduct(productData, callback) {
  const { name, product_type_id, quantity, description } = productData;

  db.query(
    "INSERT INTO products (name, product_type_id, quantity, description) VALUES (?, ?, ?, ?)",
    [name, product_type_id, quantity, description],
    (err, result) => {
      if (err) return callback(err);
      callback(null, {
        id: result.insertId,
        name,
        product_type_id,
        quantity,
        description,
      });
    }
  );
}

// READ — get all products with pagination
function selectProducts(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS count FROM products", (err, countResult) => {
    if (err) return callback(err);

    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    db.query(
      "SELECT p.id, p.name, p.quantity, p.description, pt.name AS product_type " +
        "FROM products p " +
        "LEFT JOIN product_types pt ON p.product_type_id = pt.id " +
        "ORDER BY p.id DESC LIMIT ? OFFSET ?",
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

// READ — get a single product by ID
function selectProductById(id, callback) {
  db.query(
    "SELECT p.id, p.name, p.quantity, p.description, pt.name AS product_type " +
      "FROM products p " +
      "LEFT JOIN product_types pt ON p.product_type_id = pt.id " +
      "WHERE p.id = ?",
    [id],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0] || null);
    }
  );
}

// UPDATE — modify an existing product
function updateProduct(id, fields, callback) {
  const { name, product_type_id, quantity, description } = fields;

  db.query(
    "UPDATE products SET name = ?, product_type_id = ?, quantity = ?, description = ? WHERE id = ?",
    [name, product_type_id, quantity, description, id],
    (err, result) => {
      if (err) return callback(err);

      selectProductById(id, (err2, updatedProduct) => {
        if (err2) return callback(err2);
        callback(null, updatedProduct);
      });
    }
  );
}

// DELETE — remove a product
function deleteProduct(id, callback) {
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows > 0);
  });
}

const products = {
  insertProduct,
  selectProducts,
  selectProductById,
  updateProduct,
  deleteProduct,
};

export default products;
