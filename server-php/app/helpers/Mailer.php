<?php

class Mailer
{
    private string $lastError = '';

    public function __construct(private array $config) {}

    public function sendWelcomeEmail(
        string $to,
        string $firstName,
        string $lastName,
        string $username,
        string $password
    ): bool {
        $name    = trim("{$firstName} {$lastName}");
        $subject = 'Welcome to Borrowing System – Your Account Details';
        $body    = $this->buildWelcomeBody($name, $username, $password);

        return $this->send($to, $subject, $body);
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    private function buildWelcomeBody(string $name, string $username, string $password): string
    {
        $escapedName     = htmlspecialchars($name,     ENT_QUOTES, 'UTF-8');
        $escapedUsername = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
        $escapedPassword = htmlspecialchars($password, ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:#dc2626;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Borrowing System</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#1f2937;">Hello <strong>{$escapedName}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Your account has been created. Use the credentials below to sign in.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
              <tr style="background:#f9fafb;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#6b7280;width:140px;">USERNAME</td>
                <td style="padding:12px 16px;font-size:15px;color:#1f2937;">{$escapedUsername}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#6b7280;">PASSWORD</td>
                <td style="padding:12px 16px;font-size:15px;color:#1f2937;font-family:monospace;letter-spacing:1px;">{$escapedPassword}</td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#9ca3af;">
              Please change your password after your first login.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This message was sent automatically. Please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private function send(string $to, string $subject, string $body): bool
    {
        $host       = $this->config['host']         ?? '';
        $port       = (int)($this->config['port']   ?? 587);
        $user       = $this->config['username']      ?? '';
        $pass       = $this->config['password']      ?? '';
        $from       = $this->config['from_address']  ?? $user;
        $fromName   = $this->config['from_name']     ?? 'Borrowing System';
        $encryption = strtolower($this->config['encryption'] ?? 'tls');

        if (!$host) {
            $headers = implode("\r\n", [
                "From: {$fromName} <{$from}>",
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
            ]);
            return mail($to, $subject, $body, $headers);
        }

        try {
            return $this->sendSmtp(
                $host, $port, $user, $pass,
                $from, $fromName,
                $to, $subject, $body, $encryption
            );
        } catch (\Throwable $e) {
            $this->lastError = $e->getMessage();
            error_log('Mailer error: ' . $this->lastError);
            return false;
        }
    }

    private function sendSmtp(
        string $host,
        int    $port,
        string $user,
        string $pass,
        string $from,
        string $fromName,
        string $to,
        string $subject,
        string $body,
        string $encryption
    ): bool {
        $prefix = ($encryption === 'ssl') ? 'ssl://' : '';
        $conn   = @fsockopen($prefix . $host, $port, $errno, $errstr, 15);

        if (!$conn) {
            throw new \RuntimeException("SMTP connect failed [{$errno}]: {$errstr}");
        }

        $this->smtpRead($conn);

        $this->smtpWrite($conn, "EHLO localhost");
        $this->smtpRead($conn);

        if ($encryption === 'tls') {
            $this->smtpWrite($conn, "STARTTLS");
            $this->smtpRead($conn);
            stream_socket_enable_crypto($conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $this->smtpWrite($conn, "EHLO localhost");
            $this->smtpRead($conn);
        }

        if ($user && $pass) {
            $this->smtpWrite($conn, "AUTH LOGIN");
            $this->smtpRead($conn);
            $this->smtpWrite($conn, base64_encode($user));
            $this->smtpRead($conn);
            $this->smtpWrite($conn, base64_encode($pass));
            $authResp = $this->smtpRead($conn);

            if (!str_starts_with(trim($authResp), '235')) {
                fclose($conn);
                throw new \RuntimeException("SMTP auth failed: {$authResp}");
            }
        }

        $this->smtpWrite($conn, "MAIL FROM:<{$from}>");
        $this->smtpRead($conn);

        $this->smtpWrite($conn, "RCPT TO:<{$to}>");
        $this->smtpRead($conn);

        $this->smtpWrite($conn, "DATA");
        $this->smtpRead($conn);

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $msgId          = bin2hex(random_bytes(12)) . '@borrowing';
        $headers        = implode("\r\n", [
            'Date: '       . date('r'),
            'From: '       . $fromName . ' <' . $from . '>',
            'To: '         . $to,
            'Subject: '    . $encodedSubject,
            'Message-ID: <' . $msgId . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ]);

        $encodedBody = chunk_split(base64_encode($body));
        $this->smtpWrite($conn, $headers . "\r\n\r\n" . $encodedBody . "\r\n.");

        $response = $this->smtpRead($conn);

        $this->smtpWrite($conn, "QUIT");
        fclose($conn);

        return str_starts_with(trim($response), '250');
    }

    private function smtpWrite($conn, string $data): void
    {
        fwrite($conn, $data . "\r\n");
    }

    private function smtpRead($conn): string
    {
        $response = '';
        while ($line = fgets($conn, 512)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    }

    public function getLastError(): string
    {
        return $this->lastError;
    }
}
