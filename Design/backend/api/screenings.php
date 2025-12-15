<?php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

$filmId = isset($_GET['film_id']) ? (int)$_GET['film_id'] : 0;
if ($filmId <= 0) {
  http_response_code(400);
  echo json_encode(['error' => 'bad_input']);
  exit;
}

try {
  $pdo = getConnection();

  $stmt = $pdo->prepare("
    SELECT
      id_promitnuti AS id,
      DATE_FORMAT(datum_cas, '%Y-%m-%d') AS date,
      DATE_FORMAT(datum_cas, '%H:%i') AS time,
      cena,
      id_sal
    FROM promitnuti
    WHERE id_film = ?
    ORDER BY datum_cas ASC
  ");
  $stmt->execute([$filmId]);
  $rows = $stmt->fetchAll();

  echo json_encode($rows);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'server_error']);
}
