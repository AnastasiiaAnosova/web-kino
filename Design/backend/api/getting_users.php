<?php
// backend/api/get_users.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__ . '/../utils/EncryptionHelper.php';

$key = $_ENV['APP_ENCRYPTION_KEY'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

csrfCheckOrFail();

try {
    $pdo = getConnection();

    $stmt = $pdo->query("SELECT id_uzivatel, jmeno, prijmeni, username, email, telefon, pohlavi, role, profilove_foto FROM uzivatele");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedUsers = array_map(function($u) use ($key) {
        return [
            'id' => $u['id_uzivatel'],
            'firstName' => $u['jmeno'],
            'lastName' => $u['prijmeni'],
            'username' => $u['username'],
            'email' => $u['email'],
            'phone' => $u['telefon'] ? EncryptionHelper::decrypt($u['telefon'], $key) : '',
            'gender' => $u['pohlavi'],
            'role' => $u['role'],
            'avatar' => $u['profilove_foto'] ?? null,
        ];
    }, $users);

    echo json_encode([
        'ok' => true,
        'users' => $formattedUsers
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}
