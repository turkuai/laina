<?php
// server-php/app/routes/products.php

function handle_products_route(string $method, ?string $id, PDO $pdo): void
{
    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_products($pdo);
            } else {
                get_product($pdo, $id);
            }
            break;

        case 'POST':
            create_product($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'Product ID required'], 400);
            }
            update_product($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'Product ID required'], 400);
            }
            delete_product($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_products(PDO $pdo): void
{
    $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_product(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['error' => 'Product not found'], 404);
    }

    json_response($row);
}

function create_product(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $name        = $input['name']        ?? null;
    $description = $input['description'] ?? null;
    $typeId      = $input['type_id']     ?? null;
    $locationId  = $input['location_id'] ?? null;

    if (!$name) {
        json_response(['error' => 'Missing product name'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO products (name, description, type_id, location_id, created_at)
         VALUES (:name, :description, :type_id, :location_id, NOW())'
    );
    $stmt->execute([
        ':name'        => $name,
        ':description' => $description,
        ':type_id'     => $typeId,
        ':location_id' => $locationId,
    ]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id] + $input, 201);
}

function update_product(PDO $pdo, string $id): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();

    if (!$product) {
        json_response(['error' => 'Product not found'], 404);
    }

    $name        = $input['name']        ?? $product['name'];
    $description = $input['description'] ?? $product['description'];
    $typeId      = $input['type_id']     ?? $product['type_id'];
    $locationId  = $input['location_id'] ?? $product['location_id'];

    $stmt = $pdo->prepare(
        'UPDATE products
         SET name = :name, description = :description, type_id = :type_id, location_id = :location_id
         WHERE id = :id'
    );
    $stmt->execute([
        ':name'        => $name,
        ':description' => $description,
        ':type_id'     => $typeId,
        ':location_id' => $locationId,
        ':id'          => $id,
    ]);

    json_response([
        'id'          => (int)$id,
        'name'        => $name,
        'description' => $description,
        'type_id'     => $typeId,
        'location_id' => $locationId,
    ]);
}

function delete_product(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Product not found'], 404);
    }

    json_response(['success' => true]);
}

