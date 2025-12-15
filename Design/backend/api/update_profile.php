<?php
// backend/api/update_profile.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../utils/ImageHandler.php';

// 1. Проверка метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// 2. Проверка авторизации
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

csrfCheckOrFail();

$in = jsonInput();
$userId = $_SESSION['user_id'];

// Получаем данные
$firstName = trim((string)($in['firstName'] ?? ''));
$lastName  = trim((string)($in['lastName'] ?? ''));
$email     = trim((string)($in['email'] ?? ''));
$phone     = trim((string)($in['phone'] ?? ''));
$gender    = (string)($in['gender'] ?? 'other');
$password  = (string)($in['password'] ?? ''); 
$avatar    = $in['avatar'] ?? null; 

if (!$email || !$firstName || !$lastName) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí povinné údaje']);
    exit;
}

try {
    $pdo = getConnection();

    // 4. Проверка уникальности email (исключая самого себя)
    $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ? AND id_uzivatel != ? LIMIT 1");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Tento email již používá někdo jiný']);
        exit;
    }

    // 5. Обработка аватарки
    $stmt = $pdo->prepare("SELECT profilove_foto FROM uzivatele WHERE id_uzivatel = ?");
    $stmt->execute([$userId]);
    $currentUser = $stmt->fetch();
    
    $finalPhotoUrl = $currentUser['profilove_foto']; 

    // Если пришел новый Base64
    if ($avatar && strpos($avatar, 'data:image') === 0) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = ImageHandler::saveBase64Image($avatar, $uploadDir);
        
        if ($fileName) {
            // Удаляем старое фото, если оно было
            if (!empty($finalPhotoUrl)) {
                // Извлекаем имя файла из URL (например, берем "user_123.jpg" из "http://localhost.../user_123.jpg")
                $oldFileName = basename($finalPhotoUrl); 
                $oldFilePath = $uploadDir . '/' . $oldFileName;
                
                // Удаляем файл, если он существует физически
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            // Устанавливаем новый URL (проверь порт!)
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
        $finalPhotoUrl
    ];

    if (!empty($password)) {
        $sqlPass = ", heslo = ?";
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $params[] = $hashedPassword;
    }

    $params[] = $userId;

    // 7. Update
    $sql = "UPDATE uzivatele SET 
            jmeno = ?, 
            prijmeni = ?, 
            email = ?, 
            telefon = ?, 
            pohlavi = ?, 
            profilove_foto = ? 
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
            'role' => $_SESSION['role'] ?? 'user',
            'avatar' => $finalPhotoUrl
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}