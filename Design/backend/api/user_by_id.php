<?php
// backend/api/user_by_id.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__ . '/../utils/EncryptionHelper.php';

$key = $_ENV['APP_ENCRYPTION_KEY'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Read JSON input
$in = jsonInput();
$userId = isset($in['id']) ? (int)$in['id'] : 0;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("SELECT id_uzivatel, jmeno, prijmeni, email, telefon, pohlavi, profilove_foto, `role`
                           FROM uzivatele 
                           WHERE id_uzivatel = ? 
                           LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Uživatel neexistuje']);
        exit;
    }

    echo json_encode([
        'user' => [
            'id' => $user['id_uzivatel'],
            'firstName' => $user['jmeno'],
            'lastName' => $user['prijmeni'],
            'email' => $user['email'],
            'phone' => $user['telefon'] ? EncryptionHelper::decrypt($user['telefon'], $key) : '',
            'gender' => $user['pohlavi'] ?? 'other',
            'role' => $user['role'] ?? 'user',
            'avatar' => $user['profilove_foto'] ?? null
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}
