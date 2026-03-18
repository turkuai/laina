<?php

function send_mail($to, $subject, $body)
{
    $mailConfig = $GLOBALS['config']['mail'] ?? [];
    if (empty($mailConfig['user']) || empty($mailConfig['pass'])) {
        return false;
    }

    require_once __DIR__ . '/../vendor/autoload.php';

    $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host       = $mailConfig['host'];
    $mailer->Port       = $mailConfig['port'];
    $mailer->SMTPAuth   = true;
    $mailer->Username   = $mailConfig['user'];
    $mailer->Password   = $mailConfig['pass'];
    $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mailer->CharSet    = 'UTF-8';

    $fromEmail = $mailConfig['from'] ?? $mailConfig['user'];
    $fromName  = $mailConfig['from_name'] ?? '';
    $mailer->setFrom($fromEmail, $fromName);
    $mailer->addAddress($to);
    $mailer->Subject = $subject;
    $mailer->Body    = $body;

    try {
        $mailer->send();
        return true;
    } catch (\Throwable $e) {
        return false;
    }
}