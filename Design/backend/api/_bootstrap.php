<?php
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
  session_name('webkino_session');
  session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,      // na localhost bez HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
  session_start();
}

// 20 min timeout
$timeout = 20 * 60;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout) {
  session_unset();
  session_destroy();
  session_start();
}
$_SESSION['last_activity'] = time();

function jsonInput(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);
  return is_array($data) ? $data : [];
}

function csrfCheckOrFail(): void {
  $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  if (!$csrf || $csrf !== ($_SESSION['csrf'] ?? '')) {
    http_response_code(419);
    echo json_encode(['error' => 'bad_csrf']);
    exit;
  }
}
