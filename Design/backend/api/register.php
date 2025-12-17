<?php
// backend/api/register.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../utils/ImageHandler.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

csrfCheckOrFail();
$in = jsonInput();

$firstName = trim((string)($in['firstName'] ?? ''));
$lastName  = trim((string)($in['lastName'] ?? ''));
$email     = trim((string)($in['email'] ?? ''));
$phone     = trim((string)($in['phone'] ?? ''));
$password  = (string)($in['password'] ?? '');
$gender    = (string)($in['gender'] ?? 'other');
$avatar    = $in['avatar'] ?? null;

if (!$email || strlen($password) < 6 || !$firstName) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí povinné údaje']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }

    $photoUrl = null;
    if ($avatar) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = ImageHandler::saveBase64Image($avatar, $uploadDir);
        if ($fileName) {
            $photoUrl = "http://localhost:8000/uploads/" . $fileName;
        }
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $username = explode('@', $email)[0] . rand(100, 999);

    $sql = "INSERT INTO uzivatele 
            (jmeno, prijmeni, username, email, telefon, pohlavi, role, heslo, profilove_foto, pocet_zprav) 
            VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, 0)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $firstName, 
        $lastName, 
        $username, 
        $email, 
        $phone,
        $gender, 
        $hashedPassword, 
        $photoUrl
    ]);

    $newId = $pdo->lastInsertId();

    // Автологин
    $_SESSION['user_id'] = (int)$newId;
    $_SESSION['role'] = 'user';

    echo json_encode([
        'ok' => true,
        'user' => [
            'id' => $newId,
            'firstName' => $firstName,
            'email' => $email,
            'avatar' => $photoUrl,
            'role' => 'user'
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}