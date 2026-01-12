<?php
// server-php/app/config/config.php

return [
    'db' => [
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'database' => 'lainaaminen',   // change to your DB name
        'user'     => 'root',          // XAMPP default, change if needed
        'password' => '',              // XAMPP default, change if needed
        'charset'  => 'utf8mb4',
    ],
    // Secret used to sign authentication tokens (similar to JWT secret)
    'auth_secret' => 'supersecretjwtkey', // change to a strong random string
];

