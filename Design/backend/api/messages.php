<?php
// backend/api/messages.php
require_once __DIR__.'/_bootstrap.php';
require_once __DIR__ . '/../utils/EncryptionHelper.php';

$key = $_ENV['APP_ENCRYPTION_KEY'];

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? 'inbox'; // 'inbox', 'sent', 'unread_count'

    try {
        if ($type === 'unread_count') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM zpravy WHERE id_prijemce = ? AND precteno = 0");
            $stmt->execute([$userId]);
            $count = $stmt->fetchColumn();
            echo json_encode(['count' => $count]);
            exit;
        }

        if ($type === 'inbox') {
            $sql = "
                SELECT z.*, 
                       u.username as other_username, 
                       u.jmeno as other_jmeno, 
                       u.prijmeni as other_prijmeni,
                       u.profilove_foto as other_avatar
                FROM zpravy z
                JOIN uzivatele u ON z.id_odesilatel = u.id_uzivatel
                WHERE z.id_prijemce = ?
                ORDER BY z.datum DESC
            ";
        } else {
            $sql = "
                SELECT z.*, 
                       u.username as other_username, 
                       u.jmeno as other_jmeno, 
                       u.prijmeni as other_prijmeni,
                       u.profilove_foto as other_avatar
                FROM zpravy z
                JOIN uzivatele u ON z.id_prijemce = u.id_uzivatel
                WHERE z.id_odesilatel = ?
                ORDER BY z.datum DESC
            ";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $messages = $stmt->fetchAll();

        $output = array_map(function($msg) use($key) {
            return [
                'id' => $msg['id_zprava'],
                'subject' => EncryptionHelper::decrypt($msg['predmet'], $key),
                'text' => EncryptionHelper::decrypt($msg['text'], $key),
                'date' => $msg['datum'],
                'isRead' => (bool)$msg['precteno'],
                'otherUser' => [
                    'username' => $msg['other_username'],
                    'fullName' => $msg['other_jmeno'] . ' ' . $msg['other_prijmeni'],
                    'avatar' => $msg['other_avatar']
                ]
            ];
        }, $messages);

        echo json_encode(['messages' => $output]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    csrfCheckOrFail();
    $in = jsonInput();

    $recipientUsername = trim($in['recipient'] ?? '');
    $subject = trim($in['subject'] ?? '');
    $text = trim($in['text'] ?? '');

    if (!$recipientUsername || !$subject || !$text) {
        http_response_code(400);
        echo json_encode(['error' => 'Vyplňte všechna pole']); 
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id_uzivatel FROM uzivatele WHERE username = ?");
        $stmt->execute([$recipientUsername]);
        $recipientId = $stmt->fetchColumn();

        if (!$recipientId) {
            http_response_code(404);
            echo json_encode(['error' => 'Uživatel nenalezen']); 
            exit;
        }

        if ($recipientId == $userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Nemůžete poslat zprávu sami sobě']); 
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO zpravy (id_odesilatel, id_prijemce, predmet, text, datum) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$userId, $recipientId, EncryptionHelper::encrypt($subject, $key), EncryptionHelper::encrypt($text, $key)]);

        echo json_encode(['ok' => true]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'PATCH') {
    $in = jsonInput();
    $msgId = $in['id'] ?? null;

    if (!$msgId) exit;

    $stmt = $pdo->prepare("UPDATE zpravy SET precteno = 1 WHERE id_zprava = ? AND id_prijemce = ?");
    $stmt->execute([$msgId, $userId]);
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM zpravy WHERE id_prijemce = ? AND precteno = 0");
    $stmt->execute([$userId]);
    $unreadCount = $stmt->fetchColumn();
    
    $stmt = $pdo->prepare("UPDATE uzivatele SET pocet_zprav = ? WHERE id_uzivatel = ?");
    $stmt->execute([$unreadCount, $userId]);

    echo json_encode(['ok' => true]);
    exit;
}