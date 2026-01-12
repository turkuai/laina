import db from './db.js';

function insertBorrow(borrowData, callback) {
  const {
    product_id,
    borrower_id,
    lender_id,
    borrow_date,
    estimated_return_date,
    actual_return_date,
    return_processed_by,
    notes,
  } = borrowData;

  db.query(
    `INSERT INTO borrow_history 
      (product_id, borrower_id, lender_id, borrow_date, estimated_return_date, actual_return_date, return_processed_by, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      product_id,
      borrower_id,
      lender_id,
      borrow_date || new Date(),
      estimated_return_date || null,
      actual_return_date || null,
      return_processed_by || null,
      notes || null,
    ],
    (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId, ...borrowData });
    }
  );
}

function selectBorrows(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query('SELECT COUNT(*) AS total FROM borrow_history', (err, countResult) => {
    if (err) return callback(err);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    db.query(
      `SELECT 
          bh.id,
          bh.product_id,
          p.product_name,
          bh.borrower_id,
          ub.username AS borrower_name,
          bh.lender_id,
          ul.username AS lender_name,
          bh.borrow_date,
          bh.estimated_return_date,
          bh.actual_return_date,
          bh.return_processed_by,
          ur.username AS return_processor_name,
          bh.notes,
          bh.created_at,
          bh.updated_at
       FROM borrow_history bh
       LEFT JOIN products p ON bh.product_id = p.id
       LEFT JOIN users ub ON bh.borrower_id = ub.id
       LEFT JOIN users ul ON bh.lender_id = ul.id
       LEFT JOIN users ur ON bh.return_processed_by = ur.id
       ORDER BY bh.borrow_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
      (err2, rows) => {
        if (err2) return callback(err2);
        callback(null, { page, totalPages, data: rows });
      }
    );
  });
}

function selectBorrowById(id, callback) {
  db.query(
    `SELECT 
        bh.id,
        bh.product_id,
        p.product_name,
        bh.borrower_id,
        ub.username AS borrower_name,
        bh.lender_id,
        ul.username AS lender_name,
        bh.borrow_date,
        bh.estimated_return_date,
        bh.actual_return_date,
        bh.return_processed_by,
        ur.username AS return_processor_name,
        bh.notes,
        bh.created_at,
        bh.updated_at
     FROM borrow_history bh
     LEFT JOIN products p ON bh.product_id = p.id
     LEFT JOIN users ub ON bh.borrower_id = ub.id
     LEFT JOIN users ul ON bh.lender_id = ul.id
     LEFT JOIN users ur ON bh.return_processed_by = ur.id
     WHERE bh.id = ?`,
    [id],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0] || null);
    }
  );
}

function updateBorrow(id, fields, callback) {
  const {
    actual_return_date,
    return_processed_by,
    notes,
  } = fields;

  db.query(
    `UPDATE borrow_history 
     SET actual_return_date = ?, return_processed_by = ?, notes = ?, updated_at = NOW()
     WHERE id = ?`,
    [actual_return_date || null, return_processed_by || null, notes || null, id],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows > 0);
    }
  );
}

function deleteBorrow(id, callback) {
  db.query('DELETE FROM borrow_history WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows > 0);
  });
}

export default {
  insertBorrow,
  selectBorrows,
  selectBorrowById,
  updateBorrow,
  deleteBorrow,
};
