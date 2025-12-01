import db from './db.js';

// INSERT
async function insertProduct(product) {
    const { device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired } = product;
    const [result] = await db.execute(
        'INSERT INTO products (device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [device_type_id, product_name, purchase_date, location_id, status || 'available', details, qr_code, is_retired || 0]
    );
    return result.insertId;
}

// SELECT with pagination
async function selectProducts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [[{ count }]] = await db.execute('SELECT COUNT(*) AS count FROM products WHERE is_retired = 0');
    const totalPages = Math.ceil(count / limit);

    const [rows] = await db.execute(
        `SELECT p.id, p.device_type_id, p.product_name, p.purchase_date, p.location_id, 
                p.status, p.details, p.qr_code, p.is_retired, p.created_at, p.updated_at,
                dt.type_name, l.location_name
         FROM products p
         LEFT JOIN device_types dt ON p.device_type_id = dt.id
         LEFT JOIN locations l ON p.location_id = l.id
         WHERE p.is_retired = 0
         ORDER BY p.id
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );

    return { products: rows, currentPage: page, totalPages };
}

// SELECT single product
async function selectProductById(id) {
    const [rows] = await db.execute(
        `SELECT p.id, p.device_type_id, p.product_name, p.purchase_date, p.location_id, 
                p.status, p.details, p.qr_code, p.is_retired, p.created_at, p.updated_at,
                dt.type_name, l.location_name
         FROM products p
         LEFT JOIN device_types dt ON p.device_type_id = dt.id
         LEFT JOIN locations l ON p.location_id = l.id
         WHERE p.id = ? AND p.is_retired = 0`,
        [id]
    );
    return rows[0];
}

// UPDATE
async function updateProduct(product) {
    const { device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired, id } = product;
    const [result] = await db.execute(
        'UPDATE products SET device_type_id = ?, product_name = ?, purchase_date = ?, location_id = ?, status = ?, details = ?, qr_code = ?, is_retired = ?, updated_at = NOW() WHERE id = ?',
        [device_type_id, product_name, purchase_date, location_id, status, details, qr_code, is_retired, id]
    );
    return result.affectedRows;
}

// DELETE (soft delete - set is_retired to 1)
async function deleteProduct(id) {
    const [result] = await db.execute(
        'UPDATE products SET is_retired = 1, updated_at = NOW() WHERE id = ?',
        [id]
    );
    return result.affectedRows;
}

const products = { 
    insertProduct,
    selectProducts,
    selectProductById,
    updateProduct,
    deleteProduct
};

export default products;