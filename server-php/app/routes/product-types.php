<?php
// server-php/app/routes/product-types.php

function handle_product_types_route(string $method, ?string $id, PDO $pdo): void
{
    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_product_types($pdo);
            } else {
                get_product_type($pdo, $id);
            }
            break;

        case 'POST':
            create_product_type($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'Product type ID required'], 400);
            }
            update_product_type($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'Product type ID required'], 400);
            }
            delete_product_type($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_product_types(PDO $pdo): void
{
    $stmt = $pdo->query('SELECT * FROM product_types ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_product_type(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM product_types WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['error' => 'Product type not found'], 404);
    }

    json_response($row);
}

function create_product_type(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $name = $input['name'] ?? null;

    if (!$name) {
        json_response(['error' => 'Missing product type name'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO product_types (name, created_at) VALUES (:name, NOW())'
    );
    $stmt->execute([':name' => $name]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id, 'name' => $name], 201);
}

function update_product_type(PDO $pdo, string $id): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM product_types WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $type = $stmt->fetch();

    if (!$type) {
        json_response(['error' => 'Product type not found'], 404);
    }

    $name = $input['name'] ?? $type['name'];

    $stmt = $pdo->prepare(
        'UPDATE product_types SET name = :name WHERE id = :id'
    );
    $stmt->execute([
        ':name' => $name,
        ':id'   => $id,
    ]);

    json_response(['id' => (int)$id, 'name' => $name]);
}

function delete_product_type(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM product_types WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Product type not found'], 404);
    }

    json_response(['success' => true]);
}

