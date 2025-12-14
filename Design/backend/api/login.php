<?php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

csrfCheckOrFail();

$in = jsonInput();
$login = trim((string)($in['login'] ?? ''));       // může být email nebo username
$password = (string)($in['password'] ?? '');

if ($login === '' || strlen($password) < 8) {
  http_response_code(400);
  echo json_encode(['error' => 'bad_input']);
  exit;
}

try {
  $pdo = getConnection();

  $stmt = $pdo->prepare("
    SELECT id_uzivatel, jmeno, prijmeni, username, email, role, heslo, telefon, pohlavi, profilove_foto
    FROM uzivatele
    WHERE email = ? OR username = ?
    LIMIT 1
  ");
  $stmt->execute([$login, $login]);
  $user = $stmt->fetch();

  if (!$user || empty($user['heslo']) || !password_verify($password, $user['heslo'])) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid_credentials']);
    exit;
  }

  session_regenerate_id(true);

  $_SESSION['user_id'] = (int)$user['id_uzivatel'];
  $_SESSION['role'] = $user['role'] ?? 'user';

  unset($user['heslo']);

  echo json_encode([
    'ok' => true,
    'user' => $user,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'server_error']);
}
