<?php
$env = require __DIR__ . '/env.php';

return [
    'db' => [
        'host'     => $env['DB_HOST'] ?? '127.0.0.1',
        'port'     => (int)($env['DB_PORT'] ?? 3306),
        'database' => $env['DB_NAME'] ?? 'lainaaminen',
        'user'     => $env['DB_USER'] ?? 'root',
        'password' => $env['DB_PASSWORD'] ?? '',
        'charset'  => $env['DB_CHARSET'] ?? 'utf8mb4',
    ],
    'auth_secret' => $env['AUTH_SECRET'] ?? 'supersecretjwtkey',
];
