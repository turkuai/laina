import db from "./db.js";

// INSERT — create new borrow record
function insertBorrowHistory(borrowData, callback) {
  const { product_id, borrower_id, lender_id, estimated_return_date, notes } =
    borrowData;

  db.query(
    "INSERT INTO borrow_history (product_id, borrower_id, lender_id, borrow_date, estimated_return_date, notes) VALUES (?, ?, ?, NOW(), ?, ?)",
    [product_id, borrower_id, lender_id, estimated_return_date, notes],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    }
  );
}

// SELECT — all borrow history with pagination and readable joins
function selectBorrowHistory(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS count FROM borrow_history",
    (err, countResult) => {
      if (err) return callback(err);

      const total = countResult[0].count;
      const totalPages = Math.ceil(total / limit);

      db.query(
        "SELECT bh.id, bh.product_id, p.product_name, bh.borrower_id, " +
          "CONCAT(ub.first_name, ' ', ub.last_name) AS borrower_name, " +
          "bh.lender_id, CONCAT(ul.first_name, ' ', ul.last_name) AS lender_name, " +
          "bh.borrow_date, bh.estimated_return_date, bh.actual_return_date, " +
          "bh.return_processed_by, CONCAT(ur.first_name, ' ', ur.last_name) AS return_processor_name, " +
          "bh.notes, CASE WHEN bh.actual_return_date IS NULL THEN 'On Loan' ELSE 'Returned' END AS status " +
          "FROM borrow_history bh " +
          "LEFT JOIN products p ON bh.product_id = p.id " +
          "LEFT JOIN users ub ON bh.borrower_id = ub.id " +
          "LEFT JOIN users ul ON bh.lender_id = ul.id " +
          "LEFT JOIN users ur ON bh.return_processed_by = ur.id " +
          "ORDER BY bh.borrow_date DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
          if (err) return callback(err);
          callback(null, { history: rows, currentPage: page, totalPages });
        }
      );
    }
  );
}

// SELECT — single borrow record by ID
function selectBorrowHistoryById(id, callback) {
  db.query(
    "SELECT bh.id, bh.product_id, p.product_name, bh.borrower_id, " +
      "CONCAT(ub.first_name, ' ', ub.last_name) AS borrower_name, " +
      "bh.lender_id, CONCAT(ul.first_name, ' ', ul.last_name) AS lender_name, " +
      "bh.borrow_date, bh.estimated_return_date, bh.actual_return_date, " +
      "bh.return_processed_by, CONCAT(ur.first_name, ' ', ur.last_name) AS return_processor_name, " +
      "bh.notes, CASE WHEN bh.actual_return_date IS NULL THEN 'On Loan' ELSE 'Returned' END AS status " +
      "FROM borrow_history bh " +
      "LEFT JOIN products p ON bh.product_id = p.id " +
      "LEFT JOIN users ub ON bh.borrower_id = ub.id " +
      "LEFT JOIN users ul ON bh.lender_id = ul.id " +
      "LEFT JOIN users ur ON bh.return_processed_by = ur.id " +
      "WHERE bh.id = ?",
    [id],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    }
  );
}

// SELECT — by borrower (for students to see their own history)
function selectBorrowHistoryByBorrower(borrowerId, page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS count FROM borrow_history WHERE borrower_id = ?",
    [borrowerId],
    (err, countResult) => {
      if (err) return callback(err);

      const total = countResult[0].count;
      const totalPages = Math.ceil(total / limit);

      db.query(
        "SELECT bh.id, bh.product_id, p.product_name, bh.borrower_id, " +
          "CONCAT(ub.first_name, ' ', ub.last_name) AS borrower_name, " +
          "bh.lender_id, CONCAT(ul.first_name, ' ', ul.last_name) AS lender_name, " +
          "bh.borrow_date, bh.estimated_return_date, bh.actual_return_date, " +
          "bh.return_processed_by, CONCAT(ur.first_name, ' ', ur.last_name) AS return_processor_name, " +
          "bh.notes, CASE WHEN bh.actual_return_date IS NULL THEN 'On Loan' ELSE 'Returned' END AS status " +
          "FROM borrow_history bh " +
          "LEFT JOIN products p ON bh.product_id = p.id " +
          "LEFT JOIN users ub ON bh.borrower_id = ub.id " +
          "LEFT JOIN users ul ON bh.lender_id = ul.id " +
          "LEFT JOIN users ur ON bh.return_processed_by = ur.id " +
          "WHERE bh.borrower_id = ? " +
          "ORDER BY bh.borrow_date DESC LIMIT ? OFFSET ?",
        [borrowerId, limit, offset],
        (err, rows) => {
          if (err) return callback(err);
          callback(null, { history: rows, currentPage: page, totalPages });
        }
      );
    }
  );
}

// UPDATE — mainly for adding return information or updating notes
function updateBorrowHistory(borrowData, callback) {
  const {
    id,
    estimated_return_date,
    actual_return_date,
    return_processed_by,
    notes,
  } = borrowData;

  db.query(
    "UPDATE borrow_history SET estimated_return_date = ?, actual_return_date = ?, return_processed_by = ?, notes = ? WHERE id = ?",
    [estimated_return_date, actual_return_date, return_processed_by, notes, id],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    }
  );
}

// DELETE — not usually recommended but included for completeness
function deleteBorrowHistory(id, callback) {
  db.query("DELETE FROM borrow_history WHERE id = ?", [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

const borrowHistory = {
  insertBorrowHistory,
  selectBorrowHistory,
  selectBorrowHistoryById,
  selectBorrowHistoryByBorrower,
  updateBorrowHistory,
  deleteBorrowHistory,
};

export default borrowHistory;
