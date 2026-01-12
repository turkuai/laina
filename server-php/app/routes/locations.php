<?php
// server-php/app/routes/locations.php

function handle_locations_route(string $method, ?string $id, PDO $pdo): void
{
    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_locations($pdo);
            } else {
                get_location($pdo, $id);
            }
            break;

        case 'POST':
            create_location($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'Location ID required'], 400);
            }
            update_location($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'Location ID required'], 400);
            }
            delete_location($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_locations(PDO $pdo): void
{
    $stmt = $pdo->query('SELECT * FROM locations ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_location(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM locations WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['error' => 'Location not found'], 404);
    }

    json_response($row);
}

function create_location(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $name = $input['name'] ?? null;

    if (!$name) {
        json_response(['error' => 'Missing location name'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO locations (name, created_at) VALUES (:name, NOW())'
    );
    $stmt->execute([':name' => $name]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id, 'name' => $name], 201);
}

function update_location(PDO $pdo, string $id): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM locations WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $location = $stmt->fetch();

    if (!$location) {
        json_response(['error' => 'Location not found'], 404);
    }

    $name = $input['name'] ?? $location['name'];

    $stmt = $pdo->prepare(
        'UPDATE locations SET name = :name WHERE id = :id'
    );
    $stmt->execute([
        ':name' => $name,
        ':id'   => $id,
    ]);

    json_response(['id' => (int)$id, 'name' => $name]);
}

function delete_location(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM locations WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Location not found'], 404);
    }

    json_response(['success' => true]);
}

