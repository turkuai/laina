<?php
// load .env file (u copy .env.example to .env)
$env = [];
$path = __DIR__ . '/../../.env';
if (!file_exists($path)) {
    return $env;
}
$lines = file($path, FILE_IGNORE_NEW_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    $pos = strpos($line, '=');
    if ($pos === false) continue;
    $key = trim(substr($line, 0, $pos));
    $val = trim(substr($line, $pos + 1));
    if ($key !== '') $env[$key] = $val;
}
return $env;
