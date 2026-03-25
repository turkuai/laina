<?php
// server-php/app/routes/borrowing-history.php

function handle_borrowing_history_route(string $method, ?string $id, PDO $pdo): void
{
    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_borrowing_history($pdo);
            } else {
                get_borrowing_record($pdo, $id);
            }
            break;

        case 'POST':
            create_borrowing_record($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'Borrowing record ID required'], 400);
            }
            update_borrowing_record($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'Borrowing record ID required'], 400);
            }
            delete_borrowing_record($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_borrowing_history(PDO $pdo): void
{
    // Optional filter for a specific borrower (used by students)
    $borrowerId = $_GET['borrower_id'] ?? null;
    $search = $_GET['search'] ?? null;

    $sql = "
        SELECT
            bh.id,
            bh.product_id,
            bh.borrower_id,
            bh.lender_id,
            bh.borrow_date,
            bh.estimated_return_date,
            bh.actual_return_date,
            bh.return_processed_by,
            bh.notes,
            -- Borrower name (snapshot preferred, fallback to live user data)
            COALESCE(
                NULLIF(bh.borrower_name_snapshot, ''),
                NULLIF(TRIM(CONCAT_WS(' ', borrower.first_name, borrower.last_name)), ''),
                borrower.username,
                CONCAT('User ', bh.borrower_id)
            ) AS borrower_name,
            -- Lender name (person who processed the borrow)
            NULLIF(TRIM(CONCAT_WS(' ', lender.first_name, lender.last_name)), '') AS lender_name,
            -- Product / device info
            p.product_name,
            dt.type_name AS device_name,
            p.status,
            CASE
                WHEN bh.actual_return_date IS NULL THEN 'borrowed'
                ELSE 'returned'
            END AS status_label
        FROM borrow_history bh
        LEFT JOIN users borrower    ON borrower.id = bh.borrower_id
        LEFT JOIN users lender      ON lender.id   = bh.lender_id
        LEFT JOIN products p        ON p.id         = bh.product_id
        LEFT JOIN device_types dt   ON dt.id        = p.device_type_id
        WHERE 1 = 1
            " . ($borrowerId ? "AND bh.borrower_id = :borrower_id" : "") . "
            " . (($search && trim($search) !== '') ? "
              AND (
                p.product_name LIKE :s1
                OR borrower.first_name LIKE :s2
                OR borrower.last_name  LIKE :s3
                OR borrower.username   LIKE :s4
                OR CAST(bh.borrow_date AS CHAR) LIKE :s5
                OR CAST(bh.estimated_return_date AS CHAR) LIKE :s6
                OR CAST(bh.actual_return_date AS CHAR) LIKE :s7
                OR p.status LIKE :s8
                OR bh.notes LIKE :s9
                OR lender.first_name LIKE :s10
                OR lender.last_name  LIKE :s11
                OR dt.type_name      LIKE :s12
              )
            " : "") . "
        ORDER BY bh.id DESC
    ";

    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    if ($page < 1) $page = 1;
    if ($limit < 1) $limit = 10;
    $offset = ($page - 1) * $limit;

    $sql .= " LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);
    if ($borrowerId) {
        $stmt->bindValue(':borrower_id', $borrowerId, PDO::PARAM_INT);
    }
    if ($search && trim($search) !== '') {
        $searchParam = '%' . trim($search) . '%';
        $stmt->bindValue(':s1', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s2', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s3', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s4', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s5', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s6', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s7', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s8', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s9', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s10', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s11', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s12', $searchParam, PDO::PARAM_STR);
    }
    
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $rows = $stmt->fetchAll();
    
    json_response([
        'data' => $rows,
        'pagination' => [
            'currentPage' => $page,
            'limit'       => $limit,
        ],
    ]);
}

function get_borrowing_record(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM borrow_history WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['error' => 'Borrowing record not found'], 404);
    }

    json_response($row);
}

function create_borrowing_record(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    // Support both user_id and borrower_id for compatibility
    $borrowerId = $input['borrower_id'] ?? $input['user_id'] ?? null;
    $productId = $input['product_id'] ?? null;
    $lenderId = $input['lender_id'] ?? null;
    $estimatedReturnDate = $input['estimated_return_date'] ?? null;
    $notes = $input['notes'] ?? null;

    if (!$borrowerId || !$productId) {
        json_response(['error' => 'Missing borrower_id (or user_id) or product_id'], 400);
    }

    // Build a snapshot of the borrower name at borrow time
    $nameStmt = $pdo->prepare(
        'SELECT first_name, last_name, username FROM users WHERE id = :id'
    );
    $nameStmt->execute([':id' => $borrowerId]);
    $userRow = $nameStmt->fetch();

    $borrowerNameSnapshot = null;
    if ($userRow) {
        $full = trim(($userRow['first_name'] ?? '') . ' ' . ($userRow['last_name'] ?? ''));
        $borrowerNameSnapshot = $full !== '' ? $full : ($userRow['username'] ?? null);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO borrow_history
            (borrower_id, borrower_name_snapshot, product_id, lender_id, estimated_return_date, notes, borrow_date)
         VALUES
            (:borrower_id, :borrower_name_snapshot, :product_id, :lender_id, :estimated_return_date, :notes, NOW())'
    );
    $stmt->execute([
        ':borrower_id' => $borrowerId,
        ':borrower_name_snapshot' => $borrowerNameSnapshot,
        ':product_id' => $productId,
        ':lender_id' => $lenderId,
        ':estimated_return_date' => $estimatedReturnDate,
        ':notes' => $notes,
    ]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id] + $input, 201);
}

function update_borrowing_record(PDO $pdo, string $id): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM borrow_history WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $record = $stmt->fetch();

    if (!$record) {
        json_response(['error' => 'Borrowing record not found'], 404);
    }

    // Support both returned_at and actual_return_date
    $returnedAt = $input['actual_return_date'] ?? $input['returned_at'] ?? null;
    $returnProcessedBy = $input['return_processed_by'] ?? null;

    $stmt = $pdo->prepare(
        'UPDATE borrow_history
         SET actual_return_date = COALESCE(:actual_return_date, NOW()),
             return_processed_by = COALESCE(:return_processed_by, return_processed_by)
         WHERE id = :id'
    );
    $stmt->execute([
        ':actual_return_date' => $returnedAt ? date('Y-m-d H:i:s', strtotime($returnedAt)) : date('Y-m-d H:i:s'),
        ':return_processed_by' => $returnProcessedBy,
        ':id' => $id,
    ]);

    json_response(['id' => (int)$id, 'actual_return_date' => $returnedAt]);
}

function delete_borrowing_record(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM borrow_history WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Borrowing record not found'], 404);
    }

    json_response(['success' => true]);
}

