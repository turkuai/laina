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
    $stmt = $pdo->query('SELECT * FROM borrowing_history ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_borrowing_record(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM borrowing_history WHERE id = :id');
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

    $userId    = $input['user_id']    ?? null;
    $productId = $input['product_id'] ?? null;
    $borrowedAt = $input['borrowed_at'] ?? null; // ISO string or date

    if (!$userId || !$productId) {
        json_response(['error' => 'Missing user_id or product_id'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO borrowing_history (user_id, product_id, borrowed_at)
         VALUES (:user_id, :product_id, COALESCE(:borrowed_at, NOW()))'
    );
    $stmt->execute([
        ':user_id'    => $userId,
        ':product_id' => $productId,
        ':borrowed_at'=> $borrowedAt,
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

    $stmt = $pdo->prepare('SELECT * FROM borrowing_history WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $record = $stmt->fetch();

    if (!$record) {
        json_response(['error' => 'Borrowing record not found'], 404);
    }

    $returnedAt = $input['returned_at'] ?? $record['returned_at'];

    $stmt = $pdo->prepare(
        'UPDATE borrowing_history
         SET returned_at = :returned_at
         WHERE id = :id'
    );
    $stmt->execute([
        ':returned_at' => $returnedAt,
        ':id'          => $id,
    ]);

    json_response(['id' => (int)$id, 'returned_at' => $returnedAt]);
}

function delete_borrowing_record(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM borrowing_history WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Borrowing record not found'], 404);
    }

    json_response(['success' => true]);
}

