<?php
// backend/api/payment.php
require_once __DIR__.'/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$in = jsonInput();
$reservationId = $in['reservationId'] ?? null;

if (!$reservationId) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí číslo rezervace']);
    exit;
}

try {
    $pdo = getConnection();

    // 1. Получаем данные о резервации (сумма и кто платит)
    $stmt = $pdo->prepare("SELECT id_uzivatel, celkova_castka FROM rezervace WHERE id_rezervace = ?");
    $stmt->execute([$reservationId]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        http_response_code(404);
        echo json_encode(['error' => 'Rezervace nenalezena']);
        exit;
    }

    $userId = $reservation['id_uzivatel'];
    $amount = $reservation['celkova_castka'];

    // 2. Вставляем запись в таблицу platby
    // (Используем структуру твоей таблицы: datum, castka, id_uzivatel)
    $stmt = $pdo->prepare("INSERT INTO platby (datum, castka, id_uzivatel) VALUES (NOW(), ?, ?)");
    $stmt->execute([$amount, $userId]);
    
    // Получаем ID платежа
    $paymentId = $pdo->lastInsertId();

    echo json_encode([
        'ok' => true,
        'paymentId' => $paymentId,
        'amount' => $amount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}