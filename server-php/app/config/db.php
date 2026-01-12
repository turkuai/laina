<?php
// server-php/app/config/db.php

$GLOBALS['config'] = require __DIR__ . '/config.php';
$config = $GLOBALS['config']; // Local reference for this file

$dbConf = $config['db'];

$dsn = sprintf(
    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
    $dbConf['host'],
    $dbConf['port'],
    $dbConf['database'],
    $dbConf['charset']
);

try {
    $pdo = new PDO($dsn, $dbConf['user'], $dbConf['password'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'Database connection failed',
        'details' => $e->getMessage(),
    ]);
    exit;
}

