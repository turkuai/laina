import db from './db.js';

// INSERT - Create new borrow record
async function insertBorrowHistory(borrowData) {
    const { 
        product_id, 
        borrower_id, 
        lender_id, 
        estimated_return_date, 
        notes 
    } = borrowData;
    
    const [result] = await db.execute(
        `INSERT INTO borrow_history 
        (product_id, borrower_id, lender_id, borrow_date, estimated_return_date, notes) 
        VALUES (?, ?, ?, NOW(), ?, ?)`,
        [product_id, borrower_id, lender_id, estimated_return_date, notes]
    );
    return result.insertId;
}

// SELECT with pagination and joins to get readable data
async function selectBorrowHistory(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [[{ count }]] = await db.execute(
        'SELECT COUNT(*) AS count FROM borrow_history'
    );
    const totalPages = Math.ceil(count / limit);

    const [rows] = await db.execute(
        `SELECT 
            bh.id,
            bh.product_id,
            p.product_name,
            bh.borrower_id,
            CONCAT(ub.first_name, ' ', ub.last_name) as borrower_name,
            bh.lender_id,
            CONCAT(ul.first_name, ' ', ul.last_name) as lender_name,
            bh.borrow_date,
            bh.estimated_return_date,
            bh.actual_return_date,
            bh.return_processed_by,
            CONCAT(ur.first_name, ' ', ur.last_name) as return_processor_name,
            bh.notes,
            CASE 
                WHEN bh.actual_return_date IS NULL THEN 'On Loan'
                ELSE 'Returned'
            END as status
        FROM borrow_history bh
        LEFT JOIN products p ON bh.product_id = p.id
        LEFT JOIN users ub ON bh.borrower_id = ub.id
        LEFT JOIN users ul ON bh.lender_id = ul.id
        LEFT JOIN users ur ON bh.return_processed_by = ur.id
        ORDER BY bh.borrow_date DESC
        LIMIT ? OFFSET ?`,
        [limit, offset]
    );

    return { history: rows, currentPage: page, totalPages };
}

// SELECT single borrow record by ID
async function selectBorrowHistoryById(id) {
    const [rows] = await db.execute(
        `SELECT 
            bh.id,
            bh.product_id,
            p.product_name,
            bh.borrower_id,
            CONCAT(ub.first_name, ' ', ub.last_name) as borrower_name,
            bh.lender_id,
            CONCAT(ul.first_name, ' ', ul.last_name) as lender_name,
            bh.borrow_date,
            bh.estimated_return_date,
            bh.actual_return_date,
            bh.return_processed_by,
            CONCAT(ur.first_name, ' ', ur.last_name) as return_processor_name,
            bh.notes,
            CASE 
                WHEN bh.actual_return_date IS NULL THEN 'On Loan'
                ELSE 'Returned'
            END as status
        FROM borrow_history bh
        LEFT JOIN products p ON bh.product_id = p.id
        LEFT JOIN users ub ON bh.borrower_id = ub.id
        LEFT JOIN users ul ON bh.lender_id = ul.id
        LEFT JOIN users ur ON bh.return_processed_by = ur.id
        WHERE bh.id = ?`,
        [id]
    );
    return rows[0];
}

// SELECT by borrower - for students to see their own history
async function selectBorrowHistoryByBorrower(borrowerId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [[{ count }]] = await db.execute(
        'SELECT COUNT(*) AS count FROM borrow_history WHERE borrower_id = ?',
        [borrowerId]
    );
    const totalPages = Math.ceil(count / limit);

    const [rows] = await db.execute(
        `SELECT 
            bh.id,
            bh.product_id,
            p.product_name,
            bh.borrower_id,
            CONCAT(ub.first_name, ' ', ub.last_name) as borrower_name,
            bh.lender_id,
            CONCAT(ul.first_name, ' ', ul.last_name) as lender_name,
            bh.borrow_date,
            bh.estimated_return_date,
            bh.actual_return_date,
            bh.return_processed_by,
            CONCAT(ur.first_name, ' ', ur.last_name) as return_processor_name,
            bh.notes,
            CASE 
                WHEN bh.actual_return_date IS NULL THEN 'On Loan'
                ELSE 'Returned'
            END as status
        FROM borrow_history bh
        LEFT JOIN products p ON bh.product_id = p.id
        LEFT JOIN users ub ON bh.borrower_id = ub.id
        LEFT JOIN users ul ON bh.lender_id = ul.id
        LEFT JOIN users ur ON bh.return_processed_by = ur.id
        WHERE bh.borrower_id = ?
        ORDER BY bh.borrow_date DESC
        LIMIT ? OFFSET ?`,
        [borrowerId, limit, offset]
    );

    return { history: rows, currentPage: page, totalPages };
}

// UPDATE - Mainly for adding return information or updating notes
async function updateBorrowHistory(borrowData) {
    const { 
        id,
        estimated_return_date, 
        actual_return_date,
        return_processed_by,
        notes 
    } = borrowData;
    
    const [result] = await db.execute(
        `UPDATE borrow_history 
        SET estimated_return_date = ?, 
            actual_return_date = ?, 
            return_processed_by = ?,
            notes = ?
        WHERE id = ?`,
        [estimated_return_date, actual_return_date, return_processed_by, notes, id]
    );
    return result.affectedRows;
}

// DELETE - Usually not recommended for history, but included for completeness
async function deleteBorrowHistory(id) {
    const [result] = await db.execute(
        'DELETE FROM borrow_history WHERE id = ?', 
        [id]
    );
    return result.affectedRows;
}

const borrowHistory = { 
    insertBorrowHistory,
    selectBorrowHistory,
    selectBorrowHistoryById,
    selectBorrowHistoryByBorrower,
    updateBorrowHistory,
    deleteBorrowHistory
};

export default borrowHistory;