<?php
// server-php/app/routes/device-types.php
// CRUD endpoints for device types table

function handle_device_types_route(string $method, ?string $id, PDO $pdo): void
{
    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_device_types($pdo);
            } else {
                get_device_type($pdo, $id);
            }
            break;

        case 'POST':
            create_device_type($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'Device type ID required'], 400);
            }
            update_device_type($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'Device type ID required'], 400);
            }
            delete_device_type($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_device_types(PDO $pdo): void
{
    $stmt = $pdo->query('SELECT * FROM device_types ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_device_type(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('SELECT * FROM device_types WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['error' => 'Device type not found'], 404);
    }

    json_response($row);
}

function create_device_type(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $typeName = $input['type_name'] ?? $input['name'] ?? null;
    if (!$typeName) {
        json_response(['error' => 'Missing device type name'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO device_types (type_name, created_at) VALUES (:type_name, NOW())'
    );
    $stmt->execute([':type_name' => $typeName]);

    $id = $pdo->lastInsertId();
    json_response(['id' => (int)$id, 'type_name' => $typeName], 201);
}

function update_device_type(PDO $pdo, string $id): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM device_types WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $type = $stmt->fetch();

    if (!$type) {
        json_response(['error' => 'Device type not found'], 404);
    }

    $typeName = $input['type_name'] ?? $input['name'] ?? $type['type_name'];

    $stmt = $pdo->prepare(
        'UPDATE device_types SET type_name = :type_name WHERE id = :id'
    );
    $stmt->execute([
        ':type_name' => $typeName,
        ':id'        => $id,
    ]);

    json_response(['id' => (int)$id, 'type_name' => $typeName]);
}

function delete_device_type(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare('DELETE FROM device_types WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Device type not found'], 404);
    }

    json_response(['success' => true]);
}

