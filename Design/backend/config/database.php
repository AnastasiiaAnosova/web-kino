<?php
function getConnection(): PDO {
  $DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
  $DB_PORT = getenv('DB_PORT') ?: '3306';
  $DB_USER = getenv('DB_USER') ?: 'root';
  $DB_PASS = getenv('DB_PASS') ?: '';
  $DB_NAME = getenv('DB_NAME') ?: 'kino';

  $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";

  return new PDO($dsn, $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
}
