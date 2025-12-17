<?php
// backend/api/delete_user.php
require_once __DIR__.'/_bootstrap.php';

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

// Optional: only allow admin to delete users
if (($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $pdo = getConnection();

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE id_uzivatel = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Delete user
    $stmt = $pdo->prepare("DELETE FROM uzivatele WHERE id_uzivatel = ?");
    $stmt->execute([$userId]);

    echo json_encode([
        'ok' => true,
        'deletedUserId' => $userId
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}
