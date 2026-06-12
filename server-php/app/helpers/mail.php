<?php
// Load .env file
$envFile = dirname(__DIR__, 2) . '/.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1), " \t\"'");
        $_ENV[$key] = $val;
    }
}

function get_app_url(): string
{
    if (!empty($_ENV['APP_URL'])) {
        return rtrim(trim($_ENV['APP_URL']), '/');
    }
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    return ($isHttps ? 'https://' : 'http://') . $host;
}

function send_welcome_email(string $toEmail, string $firstName, string $username, string $password, string $verifyLink): bool
{
    if (empty($_ENV['SMTP_HOST']) || empty($_ENV['SMTP_USER']) || empty($_ENV['SMTP_PASS'])) {
        return false;
    }

    require dirname(__DIR__, 2) . '/vendor/autoload.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 465);

    $mail->setFrom($_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME'] ?? 'App');
    $mail->addAddress($toEmail);
    $mail->Subject = 'Your account was created';
    $mail->Body = "Hello {$firstName},\n\nYour account was created.\n\nUsername: {$username}\nPassword: {$password}\n\nClick to verify your email (link expires in 30 min):\n{$verifyLink}\n\nYou can change your password after logging in.";

    $mail->send();
    return true;
}

function send_verification_email(string $toEmail, string $verifyLink): bool
{
    if (empty($_ENV['SMTP_HOST']) || empty($_ENV['SMTP_USER']) || empty($_ENV['SMTP_PASS'])) {
        return false;
    }
    require dirname(__DIR__, 2) . '/vendor/autoload.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 465);
    $mail->setFrom($_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME'] ?? 'App');
    $mail->addAddress($toEmail);
    $mail->Subject = 'Verify your email';
    $mail->Body = 'Verify (link expires in 30 min): ' . $verifyLink;
    $mail->send();
    return true;
}

function send_overdue_teacher_email(string $toEmail, string $teacherFirstName, string $studentName, string $productName, string $returnDate): bool
{
    if (empty($_ENV['SMTP_HOST']) || empty($_ENV['SMTP_USER']) || empty($_ENV['SMTP_PASS'])) {
        return false;
    }

    require dirname(__DIR__, 2) . '/vendor/autoload.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 465);

    $mail->setFrom($_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME'] ?? 'App');
    $mail->addAddress($toEmail);
    $mail->Subject = 'Myöhästynyt palautus: ' . $productName;
    $mail->Body = "Hei {$teacherFirstName},\n\nOppilas {$studentName} ei ole palauttanut laitetta {$productName}.\nPalautuspäivä oli {$returnDate}.\n";

    $mail->send();
    return true;
}

function send_return_reminder_email(string $toEmail, string $firstName, string $productName, string $returnDate): bool
{
    if (empty($_ENV['SMTP_HOST']) || empty($_ENV['SMTP_USER']) || empty($_ENV['SMTP_PASS'])) {
        return false;
    }

    require dirname(__DIR__, 2) . '/vendor/autoload.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 465);

    $mail->setFrom($_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME'] ?? 'App');
    $mail->addAddress($toEmail);
    $mail->Subject = 'Muistutus: Laitteen palautus';
    $mail->Body = "Hei {$firstName},\n\nMuistutus: {$productName} tulee palauttaa {$returnDate}.\n";

    $mail->send();
    return true;
}
