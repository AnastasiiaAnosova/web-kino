<?php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

$promitnutiId = isset($_GET['promitnuti_id']) ? (int)$_GET['promitnuti_id'] : 0;
if ($promitnutiId <= 0) {
  http_response_code(400);
  echo json_encode(['error' => 'bad_input']);
  exit;
}

try {
  $pdo = getConnection();

  // Vrátí seznam obsazených sedadel (cislo_sedadla) pro konkrétní promítání
  $stmt = $pdo->prepare("
    SELECT s.cislo_sedadla
    FROM rezervace_sedadla rs
    JOIN rezervace r ON r.id_rezervace = rs.id_rezervace
    JOIN sedadla s ON s.id_sedadlo = rs.id_sedadlo
    WHERE r.id_promitnuti = ?
  ");
  $stmt->execute([$promitnutiId]);

  $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

  // výstup: ["A5","B3",...]
  echo json_encode($rows);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'server_error']);
}
