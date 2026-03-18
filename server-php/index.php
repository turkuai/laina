<?php
// server-php/index.php

// Enable error reporting in development
ini_set('display_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/app/config/env.php';

// Bootstrap DB (creates $pdo)
require __DIR__ . '/app/config/db.php';

// Helper: send JSON response
function json_response($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// Helper: basic 404
function not_found(): void
{
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Not found']);
    exit;
}

// Parse URI and HTTP method dw
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove leading `/` and split
$segments = array_values(array_filter(explode('/', trim($uri, '/'))));

// When app is served from a subdirectory (e.g. /server-php/api/...),
// locate the 'api' segment anywhere in the path so routing still works.
$apiIndex = array_search('api', $segments, true);

// Routing for REST API under /api/*
if ($apiIndex !== false) {
    require __DIR__ . '/app/routes/users.php';

    $resource = $segments[$apiIndex + 1] ?? null;
    $id       = $segments[$apiIndex + 2] ?? null;

    $allowUnverified = ($resource === 'users' && in_array($id, ['login', 'logout', 'verify-email'], true))
        || ($resource === 'users' && $id === 'verify' && $method === 'GET')
        || ($resource === 'users' && $id === 'resend-verification' && $method === 'POST');

    if (!$allowUnverified) {
        require_verified_user($pdo);
    }

    switch ($resource) {
        case 'users':
            handle_users_route($method, $id, $pdo);
            break;

        case 'products':
            require __DIR__ . '/app/routes/products.php';
            handle_products_route($method, $id, $pdo);
            break;

        case 'locations':
            require __DIR__ . '/app/routes/locations.php';
            handle_locations_route($method, $id, $pdo);
            break;

        case 'borrowing-history':
            require __DIR__ . '/app/routes/borrowing-history.php';
            handle_borrowing_history_route($method, $id, $pdo);
            break;

        case 'device-types':
            require __DIR__ . '/app/routes/device-types.php';
            handle_device_types_route($method, $id, $pdo);
            break;

        case 'product-types':
            require __DIR__ . '/app/routes/product-types.php';
            handle_product_types_route($method, $id, $pdo);
            break;

        default:
            not_found();
    }
    exit;
}

// Non-API routes (server-rendered pages)

// Example: home page listing users using a PHP view
if ($uri === '/' || $uri === '/index.php') {
    try {
        $stmt = $pdo->query('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 20');
        $users = $stmt->fetchAll();
    } catch (Exception $e) {
        $users = [];
    }

    // Render view
    $pageTitle = 'Users';
    $view = __DIR__ . '/app/views/users-list.php';
    require __DIR__ . '/app/views/layout.php';
    exit;
}

// Example: /users page
if ($uri === '/users') {
    try {
        $stmt = $pdo->query('SELECT id, name, email FROM users ORDER BY id DESC');
        $users = $stmt->fetchAll();
    } catch (Exception $e) {
        $users = [];
    }

    $pageTitle = 'Users';
    $view = __DIR__ . '/app/views/users-list.php';
    require __DIR__ . '/app/views/layout.php';
    exit;
}

// If nothing matched
not_found();
