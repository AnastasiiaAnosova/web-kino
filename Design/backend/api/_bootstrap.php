<?php
// backend/api/_bootstrap.php

// 1. Настройки CORS (чтобы React не ругался)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

// 2. Подключаем твою базу данных (где лежит функция getConnection)
require_once __DIR__ . '/../config/database.php';

// 3. Старт сессии
if (session_status() === PHP_SESSION_NONE) {
    session_name('webkino_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// 4. CSRF защита
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

// 5. Вспомогательные функции
function jsonInput(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

function csrfCheckOrFail(): void {
    $headers = getallheaders();
    $csrf = $headers['X-Csrf-Token'] ?? $headers['X-CSRF-Token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    if (!$csrf || $csrf !== ($_SESSION['csrf'] ?? '')) {
        http_response_code(419);
        echo json_encode(['error' => 'bad_csrf', 'message' => 'Token mismatch']);
        exit;
    }
}