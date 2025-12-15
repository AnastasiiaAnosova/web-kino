<?php
// backend/api/login.php
require_once __DIR__.'/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

csrfCheckOrFail();
$in = jsonInput();

$login = trim((string)($in['login'] ?? ''));
$password = (string)($in['password'] ?? '');

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

    if (!$user || !password_verify($password, $user['heslo'])) {
        http_response_code(401);
        echo json_encode(['error' => 'invalid_credentials']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id_uzivatel'];
    $_SESSION['role'] = $user['role'];

    // Формируем ответ для React
    $frontendUser = [
        'id' => $user['id_uzivatel'],
        'firstName' => $user['jmeno'],
        'lastName' => $user['prijmeni'],
        'email' => $user['email'],
        'phone' => $user['telefon'], // Просто берем из базы
        'role' => $user['role'],
        'gender' => $user['pohlavi'],
        'avatar' => $user['profilove_foto']
    ];

    echo json_encode([
        'ok' => true,
        'user' => $frontendUser,
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error']);
}