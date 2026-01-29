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
    $search = $_GET['search'] ?? null;

    $sql = '
        SELECT 
           p.id, 
           p.device_type_id, 
           p.product_name, 
           p.purchase_date, 
           p.location_id, 
           p.status, 
           p.details, 
           p.qr_code, 
           p.is_retired, 
           p.flag,
           p.created_at, 
           p.updated_at,
           dt.type_name,
           l.location_name
        FROM products p
        LEFT JOIN device_types dt ON p.device_type_id = dt.id
        LEFT JOIN locations l ON p.location_id = l.id
        WHERE p.is_retired = 0
          AND (p.flag IS NULL OR p.flag != "hidden")
    ';

    if ($search && trim($search) !== '') {
        // Match by any visible column in the grid
        $sql .= '
          AND (
            p.product_name      LIKE :s1
            OR dt.type_name     LIKE :s2
            OR l.location_name  LIKE :s3
            OR CAST(p.purchase_date AS CHAR) LIKE :s4
            OR p.status         LIKE :s5
            OR p.details        LIKE :s6
            OR p.qr_code        LIKE :s7
          )
        ';
    }

    $sql .= ' ORDER BY p.id DESC';

    $stmt = $pdo->prepare($sql);

    if ($search && trim($search) !== '') {
        $searchParam = '%' . trim($search) . '%';
        $stmt->bindValue(':s1', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s2', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s3', $searchParam, PDO::PARAM_STR);
         // These reuse the same pattern for other searchable fields
        $stmt->bindValue(':s4', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s5', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s6', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s7', $searchParam, PDO::PARAM_STR);
    }

    $stmt->execute();
    $rows = $stmt->fetchAll();
    json_response($rows);
}

function get_product(PDO $pdo, string $id): void
{
    $stmt = $pdo->prepare(
        'SELECT 
           p.id, 
           p.device_type_id, 
           p.product_name, 
           p.purchase_date, 
           p.location_id, 
           p.status, 
           p.details, 
           p.qr_code, 
           p.is_retired, 
           p.created_at, 
           p.updated_at,
           dt.type_name,
           l.location_name
         FROM products p
         LEFT JOIN device_types dt ON p.device_type_id = dt.id
         LEFT JOIN locations l ON p.location_id = l.id
         WHERE p.id = :id AND p.is_retired = 0'
    );
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

    $productName    = $input['product_name']   ?? null;
    $deviceTypeId   = $input['device_type_id'] ?? null;
    $purchaseDate   = $input['purchase_date']  ?? null;
    $locationId     = $input['location_id']    ?? null;
    $status         = $input['status']         ?? 'available';
    $details        = $input['details']        ?? null;
    $qrCode         = $input['qr_code']        ?? null;
    $flag           = $input['flag']           ?? 'visible';

    if (!$productName) {
        json_response(['error' => 'Missing product name'], 400);
    }

    if (!$deviceTypeId) {
        json_response(['error' => 'Missing device type'], 400);
    }

    if (!$purchaseDate) {
        json_response(['error' => 'Missing purchase date'], 400);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO products (device_type_id, product_name, purchase_date, location_id, status, details, qr_code, flag, created_at)
         VALUES (:device_type_id, :product_name, :purchase_date, :location_id, :status, :details, :qr_code, :flag, NOW())'
    );
    $stmt->execute([
        ':device_type_id' => $deviceTypeId,
        ':product_name'   => $productName,
        ':purchase_date'  => $purchaseDate,
        ':location_id'    => $locationId,
        ':status'         => $status,
        ':details'        => $details,
        ':qr_code'        => $qrCode,
        ':flag'           => $flag,
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

    // Fetch existing product
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();

    if (!$product) {
        json_response(['error' => 'Product not found'], 404);
    }

    // Map incoming payload fields to real DB columns
    // NOTE: status is NOT updatable - it's managed by SQL triggers based on borrow_history
    $productName   = $input['product_name']    ?? $product['product_name'];
    $deviceTypeId  = $input['device_type_id']  ?? $product['device_type_id'];
    $purchaseDate  = $input['purchase_date']   ?? $product['purchase_date'];
    $locationId    = array_key_exists('location_id', $input)
        ? $input['location_id']
        : $product['location_id'];
    // Status is managed by triggers - always use current DB value, ignore any input
    $details       = array_key_exists('details', $input)
        ? $input['details']
        : $product['details'];

    // Update only editable fields - status is managed by SQL triggers
    $stmt = $pdo->prepare(
        'UPDATE products
         SET product_name   = :product_name,
             device_type_id = :device_type_id,
             purchase_date  = :purchase_date,
             location_id    = :location_id,
             details        = :details,
             updated_at     = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        ':product_name'   => $productName,
        ':device_type_id' => $deviceTypeId,
        ':purchase_date'  => $purchaseDate,
        ':location_id'    => $locationId,
        ':details'        => $details,
        ':id'             => $id,
    ]);

    // Fetch updated product to get current status (which may have been changed by triggers)
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $updatedProduct = $stmt->fetch();

    json_response([
        'id'             => (int)$id,
        'product_name'   => $productName,
        'device_type_id' => $deviceTypeId,
        'purchase_date'  => $purchaseDate,
        'location_id'    => $locationId,
        'status'         => $updatedProduct['status'], // Get current status from DB (managed by triggers)
        'details'        => $details,
    ]);
}

function delete_product(PDO $pdo, string $id): void
{
    // Ensure product exists + get current status
    $stmt = $pdo->prepare('SELECT id, status FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();

    if (!$product) {
        json_response(['error' => 'Product not found'], 404);
    }

    // Block deletion if the product is currently borrowed (active borrow record)
    // We check both the status column and borrow_history to be safe.
    if (($product['status'] ?? null) === 'borrowed') {
        json_response([
            'error' => 'Cannot delete product because it is currently borrowed. Return it first.'
        ], 409);
    }

    $stmt = $pdo->prepare(
        'SELECT 1
         FROM borrow_history
         WHERE product_id = :id AND actual_return_date IS NULL
         LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $hasActiveBorrow = (bool)$stmt->fetchColumn();

    if ($hasActiveBorrow) {
        json_response([
            'error' => 'Cannot delete product because it is currently borrowed. Return it first.'
        ], 409);
    }

    // Soft delete: mark product as hidden instead of removing it
    $stmt = $pdo->prepare(
        'UPDATE products
         SET flag = :flag
         WHERE id = :id'
    );
    $stmt->execute([
        ':flag' => 'hidden',
        ':id'   => $id,
    ]);

    json_response(['success' => true, 'flag' => 'hidden']);
}

