<?php
// server-php/app/views/layout.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($pageTitle ?? 'Lainaaminen App', ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <header>
        <h1><?= htmlspecialchars($pageTitle ?? 'Lainaaminen App', ENT_QUOTES, 'UTF-8') ?></h1>
        <nav>
            <a href="/">Home</a>
            <a href="/users">Users</a>
            <a href="/products">Products</a>
        </nav>
    </header>

    <main>
        <?php
        if (isset($view) && file_exists($view)) {
            require $view;
        } else {
            echo '<p>View not found.</p>';
        }
        ?>
    </main>

    <footer>
        <p>&copy; <?= date('Y') ?> Lainaaminen</p>
    </footer>

    <script src="/js/app.js"></script>
</body>
</html>

