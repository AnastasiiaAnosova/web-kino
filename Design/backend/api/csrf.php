<?php
require_once __DIR__.'/_bootstrap.php';

if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
}
echo json_encode(['token' => $_SESSION['csrf']]);
