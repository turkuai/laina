<?php
require_once __DIR__ . '/../helpers/mail.php';

function send_reminders(PDO $pdo): void
{
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 1;

    $stmt = $pdo->prepare('
        SELECT bh.estimated_return_date, 
               u.email, u.first_name,
               p.product_name
        FROM borrow_history bh
        JOIN users u ON bh.borrower_id = u.id
        JOIN products p ON bh.product_id = p.id
        WHERE bh.actual_return_date IS NULL
          AND bh.estimated_return_date = DATE_ADD(CURDATE(), INTERVAL :days DAY)
    ');
    $stmt->execute([':days' => $days]);
    $rows = $stmt->fetchAll();

    $sent = 0;
    foreach ($rows as $row) {
        $ok = send_return_reminder_email(
            $row['email'],
            $row['first_name'],
            $row['product_name'],
            $row['estimated_return_date']
        );
        if ($ok) $sent++;
    }

    echo json_encode(['sent' => $sent]);
}