<?php

?>
<section>
    <h2>Users</h2>

    <?php if (!empty($users)): ?>
        <ul>
            <?php foreach ($users as $user): ?>
                <li>
                    <?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8') ?>
                    (<?= htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8') ?>)
                </li>
            <?php endforeach; ?>
        </ul>
    <?php else: ?>
        <p>No users found.</p>
    <?php endif; ?>
</section>

