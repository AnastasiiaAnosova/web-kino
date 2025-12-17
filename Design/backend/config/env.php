<?php
// backend/config/env.php

$envPath = __DIR__ . '/.env';

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue;

    [$key, $value] = explode('=', $line, 2);

    $_ENV[$key] = $value;
    putenv("$key=$value");
}

