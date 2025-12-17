<?php
// backend/api/update_profile.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../utils/ImageHandler.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

csrfCheckOrFail();

$in = jsonInput();
// Use provided ID if user is admin, else use own session ID
$userId = $_SESSION['user_id'];
if (!empty($in['id']) && ($_SESSION['role'] ?? '') === 'admin') {
    $userId = (int)$in['id'];
}

$firstName = trim((string)($in['firstName'] ?? ''));
$lastName  = trim((string)($in['lastName'] ?? ''));
$email     = trim((string)($in['email'] ?? ''));
$phone     = trim((string)($in['phone'] ?? ''));
$gender    = (string)($in['gender'] ?? 'other');
$password  = (string)($in['password'] ?? ''); 
$avatar    = $in['avatar'] ?? null; 
$role      = (string)($in['role'] ?? 'user');

if (!$email || !$firstName || !$lastName) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí povinné údaje']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ? AND id_uzivatel != ? LIMIT 1");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Tento email již používá někdo jiný']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT profilove_foto FROM uzivatele WHERE id_uzivatel = ?");
    $stmt->execute([$userId]);
    $currentUser = $stmt->fetch();
    
    $finalPhotoUrl = $currentUser['profilove_foto']; 

    if ($avatar && strpos($avatar, 'data:image') === 0) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = ImageHandler::saveBase64Image($avatar, $uploadDir);
        
        if ($fileName) {
            if (!empty($finalPhotoUrl)) {
                $oldFileName = basename($finalPhotoUrl); 
                $oldFilePath = $uploadDir . '/' . $oldFileName;
                
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            $finalPhotoUrl = "http://localhost:8000/uploads/" . $fileName;
        }
    }

    // 6. Пароль
    $sqlPass = "";
    $params = [
        $firstName, 
        $lastName, 
        $email, 
        $phone, 
        $gender, 
        $finalPhotoUrl,
        $role,
    ];

    if (!empty($password)) {
        $sqlPass = ", heslo = ?";
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $params[] = $hashedPassword;
    }

    $params[] = $userId;

    $sql = "UPDATE uzivatele SET 
            jmeno = ?, 
            prijmeni = ?, 
            email = ?, 
            telefon = ?, 
            pohlavi = ?, 
            profilove_foto = ?,
            `role` = ?
            $sqlPass
            WHERE id_uzivatel = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'ok' => true,
        'user' => [
            'id' => $userId,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'gender' => $gender,
            //'role' => $_SESSION['role'] ?? 'user',
            'role' => $role,
            'avatar' => $finalPhotoUrl
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}