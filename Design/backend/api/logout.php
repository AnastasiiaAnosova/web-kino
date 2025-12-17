<?php
// backend/api/logout.php
require_once __DIR__.'/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

csrfCheckOrFail();

// If no session, still respond OK (idempotent logout)
if (session_status() !== PHP_SESSION_ACTIVE) {
    echo json_encode(['ok' => true]);
    exit;
}

// Unset all session variables
$_SESSION = [];

// Delete session cookie if it exists
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy the session
session_destroy();

echo json_encode(['ok' => true]);
