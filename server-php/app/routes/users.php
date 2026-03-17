<?php
// server-php/app/routes/users.php

/**
 * Handle /api/users, /api/users/{id}, and auth subroutes like
 * /api/users/login, /api/users/logout, /api/users/verify
 *
 * @param string      $method HTTP method (GET, POST, PUT, DELETE)
 * @param string|null $id     URL id segment, e.g. /api/users/123 or "login"
 * @param PDO         $pdo    PDO connection
 *
 * @return void
 */
function handle_users_route(string $method, ?string $id, PDO $pdo): void
{
    // Auth-related subroutes: /api/users/login, /api/users/logout, /api/users/verify
    if ($id === 'login' && $method === 'POST') {
        login_user($pdo);
        return;
    }

    if ($id === 'logout' && $method === 'POST') {
        logout_user();
        return;
    }

    if ($id === 'verify' && $method === 'GET') {
        verify_user($pdo);
        return;
    }

    if ($id === 'verify-email' && $method === 'GET') {
        verify_email_by_token($pdo);
        return;
    }

    if ($id === 'resend-verification' && $method === 'POST') {
        resend_verification($pdo);
        return;
    }

    switch ($method) {
        case 'GET':
            if ($id === null) {
                list_users($pdo);
            } else {
                get_user($pdo, $id);
            }
            break;

        case 'POST':
            create_user($pdo);
            break;

        case 'PUT':
        case 'PATCH':
            if ($id === null) {
                json_response(['error' => 'User ID required'], 400);
            }
            update_user($pdo, $id);
            break;

        case 'DELETE':
            if ($id === null) {
                json_response(['error' => 'User ID required'], 400);
            }
            delete_user($pdo, $id);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
}

function list_users(PDO $pdo): void
{
    $user = require_verified_user($pdo);

    $search = $_GET['search'] ?? null;
    
    $sql = 'SELECT id, username, first_name, last_name, email, role, phone_number, flag, created_at
            FROM users
            WHERE flag IS NULL OR flag = "visible"';
    
    if ($search && trim($search) !== '') {
        // Use unique placeholders to avoid PDO named-parameter reuse issues
        $sql .= ' AND (first_name LIKE :s1 
                       OR last_name LIKE :s2 
                       OR email LIKE :s3 
                       OR username LIKE :s4)';
    }
    
    $sql .= ' ORDER BY id DESC';
    
    $stmt = $pdo->prepare($sql);
    
    if ($search && trim($search) !== '') {
        $searchParam = '%' . trim($search) . '%';
        $stmt->bindValue(':s1', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s2', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s3', $searchParam, PDO::PARAM_STR);
        $stmt->bindValue(':s4', $searchParam, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $result = $stmt->fetchAll();

    json_response([
        'data' => $result,
        'pagination' => [
            // Simplified pagination: single page with all users
            'currentPage' => 1,
            'totalPages'  => 1,
            'totalItems'  => count($result),
            'limit'       => count($result),
        ],
    ]);
}

function get_user(PDO $pdo, string $id): void
{
    $user = require_verified_user($pdo);

    $stmt = $pdo->prepare(
        'SELECT id, username, first_name, last_name, email, role, phone_number, flag, created_at
         FROM users WHERE id = :id'
    );
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    if (!$user) {
        json_response(['error' => 'User not found'], 404);
    }

    json_response($user);
}

function create_user(PDO $pdo): void
{
    $currentUser = require_verified_user($pdo);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $username     = $input['username']     ?? null;
    $firstName    = $input['first_name']   ?? null;
    $lastName     = $input['last_name']    ?? null;
    $email        = $input['email']        ?? null;
    $password     = $input['password']     ?? null;
    $role         = $input['role']         ?? 'student';
    $phoneNumber  = $input['phone_number'] ?? null;

    if (!$username || !$email || !$password || !$firstName || !$lastName) {
        json_response(['error' => 'Missing required fields'], 400);
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $hash = bin2hex(random_bytes(32));
    $expires = gmdate('Y-m-d H:i:s', time() + 30 * 60);

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, first_name, last_name, email, password, role, phone_number, email_verified, verification_hash, verification_expires, created_at)
         VALUES (:username, :first_name, :last_name, :email, :password, :role, :phone_number, 0, :vh, :ve, NOW())'
    );
    $stmt->execute([
        ':username'     => $username,
        ':first_name'   => $firstName,
        ':last_name'    => $lastName,
        ':email'        => $email,
        ':password'     => $hashedPassword,
        ':role'         => $role,
        ':phone_number' => $phoneNumber,
        ':vh'           => $hash,
        ':ve'           => $expires,
    ]);

    $id = $pdo->lastInsertId();

    require __DIR__ . '/../helpers/mail.php';
    $link = get_app_url() . '/verify-email?token=' . $hash;
    send_welcome_email($email, $firstName, $username, $password, $link);

    json_response([
        'id'           => (int)$id,
        'username'     => $username,
        'first_name'   => $firstName,
        'last_name'    => $lastName,
        'email'        => $email,
        'role'         => $role,
        'phone_number' => $phoneNumber,
    ], 201);
}

function update_user(PDO $pdo, string $id): void
{
    $currentUser = require_verified_user($pdo);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }

    $username     = $input['username']     ?? null;
    $firstName    = $input['first_name']   ?? null;
    $lastName     = $input['last_name']    ?? null;
    $email        = $input['email']        ?? null;
    $password     = $input['password']     ?? null;
    $role         = $input['role']         ?? null;
    $phoneNumber  = $input['phone_number'] ?? null;

    // Fetch existing
    $stmt = $pdo->prepare(
        'SELECT id, username, first_name, last_name, email, password, role, phone_number
         FROM users WHERE id = :id'
    );
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    if (!$user) {
        json_response(['error' => 'User not found'], 404);
    }

    $username    = $username    ?? $user['username'];
    $firstName   = $firstName   ?? $user['first_name'];
    $lastName    = $lastName    ?? $user['last_name'];
    $email       = $email       ?? $user['email'];
    $role        = $role        ?? $user['role'];
    $phoneNumber = $phoneNumber ?? $user['phone_number'];

    // If password is being changed, verify current password first
    if ($password) {
        // Admins can change other users' passwords without knowing the current one.
        $isAdminEditingOtherUser = $currentUser['role'] === 'admin' && (int)$currentUser['id'] !== (int)$id;

        if ($isAdminEditingOtherUser) {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        } else {
            $currentPassword = $input['current_password'] ?? null;
            if (!$currentPassword) {
                json_response(['error' => 'Current password is required to change password'], 400);
                return;
            }
            if (!password_verify($currentPassword, $user['password'])) {
                json_response(['error' => 'Current password is incorrect'], 400);
                return;
            }
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        }
    } else {
        $hashedPassword = $user['password'];
    }

    $stmt = $pdo->prepare(
        'UPDATE users
         SET username = :username,
             first_name = :first_name,
             last_name = :last_name,
             email = :email,
             password = :password,
             role = :role,
             phone_number = :phone_number
         WHERE id = :id'
    );
    $stmt->execute([
        ':username'     => $username,
        ':first_name'   => $firstName,
        ':last_name'    => $lastName,
        ':email'        => $email,
        ':password'     => $hashedPassword,
        ':role'         => $role,
        ':phone_number' => $phoneNumber,
        ':id'           => $id,
    ]);

    json_response([
        'id'           => (int)$id,
        'username'     => $username,
        'first_name'   => $firstName,
        'last_name'    => $lastName,
        'email'        => $email,
        'role'         => $role,
        'phone_number' => $phoneNumber,
    ]);
}

function delete_user(PDO $pdo, string $id): void
{
    $currentUser = require_verified_user($pdo);

    // Soft delete: mark user as hidden instead of removing the row
    $stmt = $pdo->prepare('UPDATE users SET flag = "hidden" WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'User not found'], 404);
    }

    json_response(['success' => true]);
}

/**
 * -----------------------------
 * Authentication helpers
 * -----------------------------
 */

/**
 * Generate a signed auth token containing the user ID.
 */
function generate_auth_token(int $userId): string
{
    $config = $GLOBALS['config'] ?? [];
    $secret = $config['auth_secret'] ?? 'change-this-secret';

    $payload = json_encode([
        'id' => $userId,
        'ts' => time(),
    ]);

    $b64 = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', $b64, $secret);

    return $b64 . '.' . $sig;
}

/**
 * Verify a token and return the payload, or null if invalid.
 */
function verify_auth_token(string $token): ?array
{
    $config = $GLOBALS['config'] ?? [];
    $secret = $config['auth_secret'] ?? 'change-this-secret';

    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return null;
    }

    [$b64, $sig] = $parts;
    $expectedSig = hash_hmac('sha256', $b64, $secret);

    if (!hash_equals($expectedSig, $sig)) {
        return null;
    }

    $json = base64_decode(strtr($b64, '-_', '+/'));
    $payload = json_decode($json, true);

    if (!is_array($payload) || !isset($payload['id'])) {
        return null;
    }

    return $payload;
}

/**
 * Get the current authenticated user or null.
 */
function get_authenticated_user(PDO $pdo): ?array
{
    $token = $_COOKIE['authToken'] ?? null;

    if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        if (stripos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        }
    }

    if (!$token) {
        return null;
    }

    $payload = verify_auth_token($token);
    if ($payload === null) {
        return null;
    }

    $stmt = $pdo->prepare(
        'SELECT id, username, first_name, last_name, email, role, flag, email_verified
         FROM users WHERE id = :id'
    );
    $stmt->execute([':id' => $payload['id']]);
    $user = $stmt->fetch();

    if (!$user || ($user['flag'] ?? 'visible') === 'hidden') {
        return null;
    }

    return $user;
}

function require_authenticated_user(PDO $pdo): array
{
    $user = get_authenticated_user($pdo);
    if ($user === null) {
        json_response(['success' => false, 'error' => 'Unauthorized'], 401);
    }
    return $user;
}


function require_verified_user(PDO $pdo): array
{
    $user = require_authenticated_user($pdo);
    if (empty($user['email_verified'])) {
        json_response(['success' => false, 'error' => 'Email not verified', 'code' => 'EMAIL_NOT_VERIFIED'], 403);
    }
    return $user;
}

/**
 * Handle POST /api/users/login
 */
function login_user(PDO $pdo): void
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        json_response(['success' => false, 'error' => 'Invalid JSON body'], 400);
    }

    $username   = $input['username']   ?? null;
    $password   = $input['password']   ?? null;
    $rememberMe = !empty($input['rememberMe']);

    if (!$username || !$password) {
        json_response([
            'success' => false,
            'error'   => 'Username and password are required',
        ], 400);
    }

    $stmt = $pdo->prepare(
        'SELECT id, username, password, first_name, last_name, role, flag, email_verified
         FROM users
         WHERE username = :username'
    );
    $stmt->execute([':username' => $username]);
    $row = $stmt->fetch();

    if (
        !$row ||
        ($row['flag'] ?? 'visible') === 'hidden' ||
        !password_verify($password, $row['password'])
    ) {
        json_response([
            'success' => false,
            'error'   => 'Invalid username or password',
        ], 401);
    }

    $token = generate_auth_token((int)$row['id']);

    $maxAgeSeconds = $rememberMe ? (30 * 24 * 60 * 60) : (60 * 60);
    $params = session_get_cookie_params();

    setcookie(
        'authToken',
        $token,
        [
            'expires'  => time() + $maxAgeSeconds,
            'path'     => '/',
            'domain'   => $params['domain'] ?: '',
            'secure'   => false, // in dev, served over HTTP via proxy
            'httponly' => true,
            'samesite' => 'Strict',
        ]
    );

    $user = [
        'id'            => (int)$row['id'],
        'username'      => $row['username'],
        'displayName'   => $row['first_name'] . ' ' . $row['last_name'],
        'role'          => $row['role'],
        'email_verified' => !empty($row['email_verified']),
    ];

    json_response([
        'success'        => true,
        'message'        => 'Login successful',
        'user'           => $user,
        'email_verified' => !empty($row['email_verified']),
    ]);
}

/**
 * Handle POST /api/users/logout
 */
function logout_user(): void
{
    $params = session_get_cookie_params();

    setcookie(
        'authToken',
        '',
        [
            'expires'  => time() - 3600,
            'path'     => '/',
            'domain'   => $params['domain'] ?: '',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Strict',
        ]
    );

    json_response([
        'success' => true,
        'message' => 'Logged out successfully',
    ]);
}

/**
 * Handle GET /api/users/verify
 */
function verify_user(PDO $pdo): void
{
    $user = get_authenticated_user($pdo);

    if ($user === null) {
        json_response(['success' => false, 'error' => 'Unauthorized'], 401);
    }

    $safeUser = [
        'id'             => (int)$user['id'],
        'username'       => $user['username'],
        'displayName'    => $user['first_name'] . ' ' . $user['last_name'],
        'role'           => $user['role'],
        'email_verified'  => !empty($user['email_verified']),
    ];

    json_response([
        'success'        => true,
        'user'           => $safeUser,
        'email_verified' => !empty($user['email_verified']),
    ]);
}

function verify_email_by_token(PDO $pdo): void
{
    $token = trim((string)($_GET['token'] ?? ''));
    if ($token === '') {
        json_response(['success' => false, 'error' => 'Missing token'], 400);
        return;
    }

    $stmt = $pdo->prepare(
        'SELECT id FROM users WHERE verification_hash = :h AND verification_expires > UTC_TIMESTAMP()'
    );
    $stmt->execute([':h' => $token]);
    $row = $stmt->fetch();
    if (!$row) {
        json_response(['success' => false, 'error' => 'Invalid or expired link'], 400);
        return;
    }

    $stmt = $pdo->prepare(
        'UPDATE users SET email_verified = 1, verification_hash = NULL, verification_expires = NULL WHERE id = :id'
    );
    $stmt->execute([':id' => $row['id']]);

    json_response(['success' => true]);
}

function resend_verification(PDO $pdo): void
{
    $user = require_authenticated_user($pdo);

    $stmt = $pdo->prepare('SELECT email_verified, email FROM users WHERE id = :id');
    $stmt->execute([':id' => $user['id']]);
    $row = $stmt->fetch();
    if (!$row || !empty($row['email_verified'])) {
        json_response(['success' => true]);
        return;
    }

    $hash = bin2hex(random_bytes(32));
    $expires = gmdate('Y-m-d H:i:s', time() + 30 * 60);
    $stmt = $pdo->prepare('UPDATE users SET verification_hash = :h, verification_expires = :e WHERE id = :id');
    $stmt->execute([':h' => $hash, ':e' => $expires, ':id' => $user['id']]);

    require __DIR__ . '/../helpers/mail.php';
    $link = get_app_url() . '/verify-email?token=' . $hash;
    send_verification_email($row['email'], $link);

    json_response(['success' => true]);
}
