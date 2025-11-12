import db from './db.js';

const DEFAULT_PAGE_SIZE = 20;

export async function createProduct(product) {
  const {
    device_type_id,
    product_name,
    purchase_date,
    location_id = null,
    status = 'available',
    details = null,
    qr_code = null,
    is_retired = 0
  } = product;

  const [result] = await db.query(
    `INSERT INTO products 
      (device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired]
  );

  return { id: result.insertId };
}

export async function listProducts({ page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const safeLimit = Math.min(Number(limit) || DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) AS total FROM products WHERE is_retired = 0'
  );

  const [rows] = await db.query(
    `SELECT id, device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired, created_at, updated_at
     FROM products
     WHERE is_retired = 0
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [safeLimit, offset]
  );

  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);

  return {
    items: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems: total,
      totalPages
    }
  };
}

export async function getProductById(id) {
  const [rows] = await db.query(
    `SELECT id, device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired, created_at, updated_at
     FROM products WHERE id = ? AND is_retired = 0`,
    [id]
  );
  return rows[0] || null;
}

export async function updateProduct(id, updates) {
  const allowed = ['device_type_id', 'product_name', 'purchase_date', 'location_id', 'status', 'details', 'qr_code', 'is_retired'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  values.push(id);

  const [result] = await db.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return { affectedRows: result.affectedRows };
}

export async function deleteProduct(id) {
  const [result] = await db.query(
    'UPDATE products SET is_retired = 1 WHERE id = ?',
    [id]
  );
  return { affectedRows: result.affectedRows };
}


