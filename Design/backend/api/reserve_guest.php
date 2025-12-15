<?php
// backend/api/reserve_guest.php
require_once __DIR__.'/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$in = jsonInput();
$pdo = getConnection();

// Данные с фронтенда
$showtimeId = $in['showtimeId'] ?? null;
$seats = $in['seats'] ?? []; // Массив ['A1', 'B2']
$customerData = $in['customerData'] ?? [];

// Валидация
if (!$showtimeId || empty($seats)) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí údaje o rezervaci']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. ОПРЕДЕЛЯЕМ ПОЛЬЗОВАТЕЛЯ (ID)
    $userId = null;

    if (!empty($_SESSION['user_id'])) {
        // Если пользователь залогинен
        $userId = $_SESSION['user_id'];
    } else {
        // Если гость, проверяем данные
        $email = trim($customerData['email'] ?? '');
        $name = trim($customerData['name'] ?? '');
        $phone = trim($customerData['phone'] ?? '');

        if (!$email || !$name) {
            throw new Exception("Chybí kontaktní údaje");
        }

        // Проверяем, есть ли уже такой email
        $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ?");
        $stmt->execute([$email]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            $userId = $existingId;
            // Можно обновить имя/телефон, если нужно
        } else {
            // Создаем нового пользователя-гостя
            // Разделяем имя на Имя и Фамилию (просто по первому пробелу)
            $parts = explode(' ', $name, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';

            $stmt = $pdo->prepare("INSERT INTO uzivatele (jmeno, prijmeni, email, telefon, role, pocet_zprav) VALUES (?, ?, ?, ?, 'host', 0)");
            $stmt->execute([$firstName, $lastName, $email, $phone]);
            $userId = $pdo->lastInsertId();
        }
    }

    // 2. ПОЛУЧАЕМ ИНФОРМАЦИЮ О СЕАНСЕ (ЦЕНА И ЗАЛ)
    $stmt = $pdo->prepare("SELECT cena, id_sal FROM promitnuti WHERE id_promitnuti = ?");
    $stmt->execute([$showtimeId]);
    $showtimeInfo = $stmt->fetch();

    if (!$showtimeInfo) throw new Exception("Promítání neexistuje");

    $pricePerTicket = $showtimeInfo['cena'];
    $hallId = $showtimeInfo['id_sal'];
    $totalPrice = $pricePerTicket * count($seats);

    // 3. СОЗДАЕМ РЕЗЕРВАЦИЮ
    $stmt = $pdo->prepare("INSERT INTO rezervace (datum, id_uzivatel, celkova_castka, id_promitnuti) VALUES (NOW(), ?, ?, ?)");
    $stmt->execute([$userId, $totalPrice, $showtimeId]);
    $reservationId = $pdo->lastInsertId();

    // 4. БРОНИРУЕМ МЕСТА
    // Нам нужно найти ID каждого места (A1, A2...) в таблице sedadla для конкретного зала
    $stmtSeatId = $pdo->prepare("SELECT id_sedadlo FROM sedadla WHERE cislo_sedadla = ? AND id_sal = ?");
    $stmtInsertSeat = $pdo->prepare("INSERT INTO rezervace_sedadla (id_rezervace, id_sedadlo) VALUES (?, ?)");

    foreach ($seats as $seatNumber) {
        // Ищем ID места в базе
        $stmtSeatId->execute([$seatNumber, $hallId]);
        $seatDbId = $stmtSeatId->fetchColumn();

        if (!$seatDbId) {
            // Если места нет в базе, его надо создать (на случай, если база пустая)
            // В идеале база должна быть заполнена, но добавим страховку:
            $stmtCreate = $pdo->prepare("INSERT INTO sedadla (cislo_sedadla, id_sal, stav) VALUES (?, ?, 'available')");
            $stmtCreate->execute([$seatNumber, $hallId]);
            $seatDbId = $pdo->lastInsertId();
        }

        // Проверяем, не занято ли место УЖЕ на этот сеанс (Concurrency check)
        $checkStmt = $pdo->prepare("
            SELECT 1 FROM rezervace_sedadla rs
            JOIN rezervace r ON rs.id_rezervace = r.id_rezervace
            WHERE rs.id_sedadlo = ? AND r.id_promitnuti = ?
        ");
        $checkStmt->execute([$seatDbId, $showtimeId]);
        if ($checkStmt->fetch()) {
            throw new Exception("Sedadlo $seatNumber je již obsazené.");
        }

        // Связываем место с резервацией
        $stmtInsertSeat->execute([$reservationId, $seatDbId]);
    }

    $pdo->commit();

    echo json_encode([
        'ok' => true,
        'id' => $reservationId,
        'ticketNumber' => 'TICKET-' . str_pad($reservationId, 6, '0', STR_PAD_LEFT), // Генерируем номер билета
        'status' => 'confirmed'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}