// server/db/product-types.js
import db from './db.js';

// CREATE - insert a new product type
async function insertProductType(name, description) {
  const [result] = await db.execute(
    'INSERT INTO product_types (name, description) VALUES (?, ?)',
    [name, description]
  );
  return { id: result.insertId, name, description };
}

// READ - get paginated list of product types
async function selectProductTypes(page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM product_types');
  const [rows] = await db.query(
    'SELECT * FROM product_types ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: count,
      limit,
    },
  };
}

// READ - get a single product type by ID
async function selectProductTypeById(id) {
  const [rows] = await db.query('SELECT * FROM product_types WHERE id = ?', [id]);
  return rows[0] || null;
}

// UPDATE - modify an existing product type
async function updateProductType(id, fields) {
  const { name, description } = fields;
  await db.execute(
    'UPDATE product_types SET name = ?, description = ? WHERE id = ?',
    [name, description, id]
  );
  return selectProductTypeById(id);
}

// DELETE - remove a product type
async function deleteProductType(id) {
  const [result] = await db.execute('DELETE FROM product_types WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  insertProductType,
  selectProductTypes,
  selectProductTypeById,
  updateProductType,
  deleteProductType,
};