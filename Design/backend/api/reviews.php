<?php
// backend/api/reviews.php
require_once __DIR__.'/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

if ($method === 'GET') {
    $filmId = $_GET['film_id'] ?? null;
    if (!$filmId) {
        http_response_code(400);
        exit;
    }

    $currentUserId = $_SESSION['user_id'] ?? 0;

    $sql = "
        SELECT 
            r.id_recenze, r.komentar, r.pocet_like, r.pocet_dislike, r.datum_vytvoreni, r.parent_id,
            u.jmeno, u.prijmeni, u.profilove_foto,
            h.hodnoceni as user_rating,
            (SELECT typ_hodnoceni FROM hodnoceni WHERE id_recenze = r.id_recenze AND id_uzivatel = ?) as my_reaction
        FROM recenze r
        JOIN uzivatele u ON r.id_uzivatel = u.id_uzivatel
        LEFT JOIN hvezdicky h ON (h.id_film = r.id_film AND h.id_uzivatel = u.id_uzivatel)
        WHERE r.id_film = ?
        ORDER BY r.datum_vytvoreni DESC
    ";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$currentUserId, $filmId]);
        $allReviews = $stmt->fetchAll();

        $reviewsMap = [];
        $rootReviews = [];

        foreach ($allReviews as $row) {
            $review = [
                'id' => (int)$row['id_recenze'],
                'author' => $row['jmeno'] . ' ' . $row['prijmeni'],
                'avatar' => $row['profilove_foto'],
                'rating' => $row['user_rating'] ? (int)$row['user_rating'] : 0,
                'date' => $row['datum_vytvoreni'] ? date('Y-m-d', strtotime($row['datum_vytvoreni'])) : date('Y-m-d'),
                'text' => $row['komentar'],
                'likes' => (int)$row['pocet_like'],
                'dislikes' => (int)$row['pocet_dislike'],
                'userReaction' => $row['my_reaction'],
                'replies' => []
            ];
            $reviewsMap[$row['id_recenze']] = $review;
        }

        foreach ($allReviews as $row) {
            $parentId = $row['parent_id'];
            $currentId = $row['id_recenze'];

            if ($parentId && isset($reviewsMap[$parentId])) {
                $reviewsMap[$parentId]['replies'][] = $reviewsMap[$currentId];
            } else {
                $rootReviews[] = $currentId;
            }
        }

        $finalOutput = [];
        foreach ($rootReviews as $id) {
            $finalOutput[] = $reviewsMap[$id];
        }

        echo json_encode(['reviews' => $finalOutput]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'unauthorized']);
        exit;
    }

    csrfCheckOrFail();
    $in = jsonInput();

    $userId = $_SESSION['user_id'];
    $filmId = $in['filmId'] ?? null;
    $text = trim((string)($in['text'] ?? ''));
    $rating = isset($in['rating']) ? (int)$in['rating'] : null;
    $parentId = !empty($in['parentReplyId']) ? (int)$in['parentReplyId'] : null;

    if (!$filmId || !$text) {
        http_response_code(400);
        echo json_encode(['error' => 'Chybí text nebo ID filmu']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO recenze (komentar, id_uzivatel, id_film, parent_id, pocet_like, pocet_dislike, datum_vytvoreni) VALUES (?, ?, ?, ?, 0, 0, NOW())");
        $stmt->execute([$text, $userId, $filmId, $parentId]);
        $reviewId = $pdo->lastInsertId();

        if (!$parentId && $rating > 0) {
            $stmt = $pdo->prepare("INSERT INTO hvezdicky (hodnoceni, id_film, id_uzivatel) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE hodnoceni = ?");
            $stmt->execute([$rating, $filmId, $userId, $rating]);
        }

        $pdo->commit();

        $stmt = $pdo->prepare("SELECT jmeno, prijmeni, profilove_foto FROM uzivatele WHERE id_uzivatel = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        echo json_encode([
            'ok' => true,
            'review' => [
                'id' => $reviewId,
                'author' => $user['jmeno'] . ' ' . $user['prijmeni'],
                'avatar' => $user['profilove_foto'],
                'rating' => $rating,
                'date' => date('Y-m-d'),
                'text' => $text,
                'likes' => 0,
                'dislikes' => 0,
                'replies' => []
            ]
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}