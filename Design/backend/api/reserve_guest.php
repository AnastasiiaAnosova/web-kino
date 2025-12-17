<?php
// backend/api/reserve_guest.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__ . '/../utils/EncryptionHelper.php';

$key = $_ENV['APP_ENCRYPTION_KEY'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$in = jsonInput();
$pdo = getConnection();

$showtimeId = $in['showtimeId'] ?? null;
$seats = $in['seats'] ?? [];
$customerData = $in['customerData'] ?? [];

// Валидация
if (!$showtimeId || empty($seats)) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí údaje o rezervaci']);
    exit;
}

try {
    $pdo->beginTransaction();

    $userId = null;

    if (!empty($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
    } else {
        $email = trim($customerData['email'] ?? '');
        $name = trim($customerData['name'] ?? '');
        $phoneInput = trim($customerData['phone'] ?? '');
        $phone = EncryptionHelper::encrypt($phoneInput, $key);

        if (!$email || !$name) {
            throw new Exception("Chybí kontaktní údaje");
        }
        $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ?");
        $stmt->execute([$email]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            $userId = $existingId;
        } else {
            $parts = explode(' ', $name, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';

            $stmt = $pdo->prepare("INSERT INTO uzivatele (jmeno, prijmeni, email, telefon, role, pocet_zprav) VALUES (?, ?, ?, ?, 'host', 0)");
            $stmt->execute([$firstName, $lastName, $email, $phone]);
            $userId = $pdo->lastInsertId();
        }
    }

    $stmt = $pdo->prepare("SELECT cena, id_sal FROM promitnuti WHERE id_promitnuti = ?");
    $stmt->execute([$showtimeId]);
    $showtimeInfo = $stmt->fetch();

    if (!$showtimeInfo) throw new Exception("Promítání neexistuje");

    $pricePerTicket = $showtimeInfo['cena'];
    $hallId = $showtimeInfo['id_sal'];
    $totalPrice = $pricePerTicket * count($seats);

    $stmt = $pdo->prepare("INSERT INTO rezervace (datum, id_uzivatel, celkova_castka, id_promitnuti) VALUES (NOW(), ?, ?, ?)");
    $stmt->execute([$userId, $totalPrice, $showtimeId]);
    $reservationId = $pdo->lastInsertId();

    $stmtSeatId = $pdo->prepare("SELECT id_sedadlo FROM sedadla WHERE cislo_sedadla = ? AND id_sal = ?");
    $stmtInsertSeat = $pdo->prepare("INSERT INTO rezervace_sedadla (id_rezervace, id_sedadlo) VALUES (?, ?)");

    foreach ($seats as $seatNumber) {
        $stmtSeatId->execute([$seatNumber, $hallId]);
        $seatDbId = $stmtSeatId->fetchColumn();

        if (!$seatDbId) {
            $stmtCreate = $pdo->prepare("INSERT INTO sedadla (cislo_sedadla, id_sal, stav) VALUES (?, ?, 'available')");
            $stmtCreate->execute([$seatNumber, $hallId]);
            $seatDbId = $pdo->lastInsertId();
        }

        $checkStmt = $pdo->prepare("
            SELECT 1 FROM rezervace_sedadla rs
            JOIN rezervace r ON rs.id_rezervace = r.id_rezervace
            WHERE rs.id_sedadlo = ? AND r.id_promitnuti = ?
        ");
        $checkStmt->execute([$seatDbId, $showtimeId]);
        if ($checkStmt->fetch()) {
            throw new Exception("Sedadlo $seatNumber je již obsazené.");
        }
        $stmtInsertSeat->execute([$reservationId, $seatDbId]);
    }

    $pdo->commit();

    echo json_encode([
        'ok' => true,
        'id' => $reservationId,
        'ticketNumber' => 'TICKET-' . str_pad($reservationId, 6, '0', STR_PAD_LEFT), 
        'status' => 'confirmed'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}