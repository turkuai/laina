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

    // Accept either 'name' or 'location_name' for the location name
    $name = $input['location_name'] ?? $input['name'] ?? null;
    $description = $input['description'] ?? null;

    if (!$name || trim((string)$name) === '') {
        json_response(['error' => 'Missing location name'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO locations (location_name, description, created_at) VALUES (:location_name, :description, NOW())'
    );
    $stmt->execute([
        ':location_name' => trim($name),
        ':description'   => $description !== null ? trim((string)$description) : null,
    ]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id, 'location_name' => trim($name), 'description' => $description], 201);
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

    $locationName = $input['location_name'] ?? $input['name'] ?? $location['location_name'];
    $description = array_key_exists('description', $input) ? $input['description'] : $location['description'];

    $stmt = $pdo->prepare(
        'UPDATE locations SET location_name = :location_name, description = :description WHERE id = :id'
    );
    $stmt->execute([
        ':location_name' => $locationName,
        ':description'   => $description,
        ':id'             => $id,
    ]);

    json_response(['id' => (int)$id, 'location_name' => $locationName, 'description' => $description]);
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

