<?php
// server-php/app/config/config.php

/**
 * Read environment variables with fallback.
 * Note: getenv() returns false when missing.
 */
function env_value(string $key, $default = null)
{
    $val = getenv($key);
    return ($val === false) ? $default : $val;
}

function env_int(string $key, int $default): int
{
    $val = env_value($key, null);
    if ($val === null || $val === '') {
        return $default;
    }
    $int = filter_var($val, FILTER_VALIDATE_INT);
    return ($int === false) ? $default : (int) $int;
}

return [
    'db' => [
        'host'     => env_value('DB_HOST', '127.0.0.1'),
        'port'     => env_int('DB_PORT', 3306),
        'database' => env_value('DB_NAME', 'lainaaminen'),
        'user'     => env_value('DB_USER', 'root'),
        'password' => env_value('DB_PASSWORD', ''),
        'charset'  => env_value('DB_CHARSET', 'utf8mb4'),
    ],
    // Secret used to sign authentication tokens (similar to JWT secret)
    'auth_secret' => env_value('AUTH_SECRET', 'supersecretjwtkey'),
];

