<?php
// backend/api/get_users.php
require_once __DIR__.'/_bootstrap.php';

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

    $stmt = $pdo->query("SELECT id_uzivatel, jmeno, prijmeni, email, telefon, pohlavi, profilove_foto FROM uzivatele");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedUsers = array_map(function($u) {
        return [
            'id' => $u['id_uzivatel'],
            'firstName' => $u['jmeno'],
            'lastName' => $u['prijmeni'],
            'email' => $u['email'],
            'phone' => $u['telefon'],
            'gender' => $u['pohlavi'],
            'role' => 'user',
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
