<?php
// backend/api/likes.php
require_once __DIR__.'/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Проверяем авторизацию
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

csrfCheckOrFail();
$in = jsonInput();

$userId = $_SESSION['user_id'];
$reviewId = $in['reviewId'] ?? null;
$type = $in['type'] ?? null; // 'LIKE' или 'DISLIKE'

if (!$reviewId || !in_array($type, ['LIKE', 'DISLIKE'])) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_input']);
    exit;
}

try {
    $pdo = getConnection();

    // 1. Проверяем, есть ли уже оценка от этого юзера
    $stmt = $pdo->prepare("SELECT typ_hodnoceni FROM hodnoceni WHERE id_recenze = ? AND id_uzivatel = ?");
    $stmt->execute([$reviewId, $userId]);
    $existing = $stmt->fetchColumn();

    if ($existing === $type) {
        // Если уже стоит такой же лайк -> удаляем (как бы "отжимаем" кнопку)
        $stmt = $pdo->prepare("DELETE FROM hodnoceni WHERE id_recenze = ? AND id_uzivatel = ?");
        $stmt->execute([$reviewId, $userId]);
    } else {
        if ($existing) {
            // Если стоял DISLIKE, а нажали LIKE (или наоборот) -> обновляем
            $stmt = $pdo->prepare("UPDATE hodnoceni SET typ_hodnoceni = ? WHERE id_recenze = ? AND id_uzivatel = ?");
            $stmt->execute([$type, $reviewId, $userId]);
        } else {
            // Если ничего не стояло -> вставляем новую запись
            $stmt = $pdo->prepare("INSERT INTO hodnoceni (typ_hodnoceni, id_recenze, id_uzivatel) VALUES (?, ?, ?)");
            $stmt->execute([$type, $reviewId, $userId]);
        }
    }

    // Триггеры в БД (t_rating_after_insert/update/delete) сами обновят счетчики в таблице recenze.
    
    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}