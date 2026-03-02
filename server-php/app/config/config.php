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
    'mail' => [
        'host'         => $env['MAIL_HOST']         ?? '',
        'port'         => (int)($env['MAIL_PORT']   ?? 587),
        'username'     => $env['MAIL_USERNAME']      ?? '',
        'password'     => $env['MAIL_PASSWORD']      ?? '',
        'encryption'   => $env['MAIL_ENCRYPTION']    ?? 'tls',
        'from_address' => $env['MAIL_FROM_ADDRESS']  ?? '',
        'from_name'    => $env['MAIL_FROM_NAME']     ?? 'Borrowing System',
    ],
];
