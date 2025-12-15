<?php
// backend/api/update_profile.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__.'/../utils/ImageHandler.php';

// 1. Проверка метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// 2. Проверка авторизации (пользователь должен быть залогинен)
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

// 3. CSRF проверка
csrfCheckOrFail();

$in = jsonInput();
$userId = $_SESSION['user_id'];

// Получаем данные из формы
$firstName = trim((string)($in['firstName'] ?? ''));
$lastName  = trim((string)($in['lastName'] ?? ''));
$email     = trim((string)($in['email'] ?? ''));
$phone     = trim((string)($in['phone'] ?? ''));
$gender    = (string)($in['gender'] ?? 'other');
$password  = (string)($in['password'] ?? ''); // Может быть пустым
$avatar    = $in['avatar'] ?? null; // Может быть Base64, URL или null

if (!$email || !$firstName || !$lastName) {
    http_response_code(400);
    echo json_encode(['error' => 'Chybí povinné údaje']);
    exit;
}

try {
    $pdo = getConnection();

    // 4. Проверяем, не занят ли email ДРУГИМ пользователем
    // Ищем user с таким email, но у которого ID НЕ равен нашему
    $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE email = ? AND id_uzivatel != ? LIMIT 1");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Tento email již používá někdo jiný']);
        exit;
    }

    // 5. Обработка аватарки
    // Сначала получим текущую аватарку из базы, чтобы знать, что обновлять
    $stmt = $pdo->prepare("SELECT profilove_foto, heslo FROM uzivatele WHERE id_uzivatel = ?");
    $stmt->execute([$userId]);
    $currentUser = $stmt->fetch();
    
    $finalPhotoUrl = $currentUser['profilove_foto']; // По умолчанию оставляем старую

    // Если пришел Base64 (начинается с data:image), значит загрузили новую
    if ($avatar && strpos($avatar, 'data:image') === 0) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = ImageHandler::saveBase64Image($avatar, $uploadDir);
        if ($fileName) {
            // ВАЖНО: Укажи тот же путь, что и в register.php
            // Если через php -S localhost:8000:
            $finalPhotoUrl = "http://localhost:8000/uploads/" . $fileName;
        }
    }

    // 6. Обработка пароля
    $sqlPass = "";
    $params = [
        $firstName, 
        $lastName, 
        $email, 
        $phone, 
        $gender, 
        $finalPhotoUrl
    ];

    // Если пароль прислали (он не пустой) -> меняем его
    if (!empty($password)) {
        $sqlPass = ", heslo = ?";
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $params[] = $hashedPassword;
    }

    // Добавляем ID в конец параметров для WHERE
    $params[] = $userId;

    // 7. Обновление в базе
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

    // 8. Возвращаем обновленного юзера на фронт
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