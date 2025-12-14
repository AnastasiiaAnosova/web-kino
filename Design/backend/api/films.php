<?php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

try {
  $pdo = getConnection();

  $rows = $pdo->query("
    SELECT
      id_film        AS id,
      nazev          AS title,
      reziser        AS director,
      rok_vydani     AS year,
      zeme           AS country,
      jazyk          AS language,
      popis          AS description,
      delka_filmu    AS length_min,
      vekove_omezeni AS age_limit,
      zanr           AS genre,
      oceneni        AS awards,
      prumer_hodnoceni AS avg_rating
    FROM filmy
    ORDER BY nazev
  ")->fetchAll();

  echo json_encode($rows);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'server_error']);
}
