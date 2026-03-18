<?php
$envFile = __DIR__ . '/../../.env';
if (!is_readable($envFile)) return;
foreach (file($envFile) ?: [] as $line) {
    $line = trim($line);
    if ($line === '') continue;
    if ($line[0] === '#') continue;
    $parts = explode('=', $line, 2);
    $key = trim($parts[0]);
    $value = trim($parts[1] ?? '');
    putenv("$key=$value");
}
