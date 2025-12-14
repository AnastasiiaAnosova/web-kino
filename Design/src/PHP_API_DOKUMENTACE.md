# PHP API Dokumentace pro Graphite Kinematograf

Tento dokument popisuje požadovanou strukturu PHP API pro integraci s React aplikací.

## Základní informace

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (doporučeno)
- **CORS**: Musí být povoleno

## Database Schema

### Tabulka: `films`
```sql
CREATE TABLE films (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    year VARCHAR(4),
    duration VARCHAR(20),
    image VARCHAR(500),
    description TEXT,
    country VARCHAR(100),
    language VARCHAR(100),
    rating DECIMAL(2,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabulka: `showtimes`
```sql
CREATE TABLE showtimes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);
```

### Tabulka: `awards`
```sql
CREATE TABLE awards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film_id INT NOT NULL,
    award_text TEXT NOT NULL,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);
```

### Tabulka: `users`
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabulka: `reviews`
```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film_id INT NOT NULL,
    user_id INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabulka: `review_replies`
```sql
CREATE TABLE review_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    parent_reply_id INT DEFAULT NULL,
    user_id INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES review_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabulka: `reservations`
```sql
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film_id INT NOT NULL,
    showtime_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'paid', 'cancelled') DEFAULT 'pending',
    ticket_number VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES films(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);
```

### Tabulka: `reservation_seats`
```sql
CREATE TABLE reservation_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. Filmy

#### GET `/api/films`
Načtení všech filmů včetně promítání.

**Response:**
```json
{
  "films": [
    {
      "id": "1",
      "title": "MODERNÍ DOBA",
      "subtitle": "CHARLES CHAPLIN",
      "year": "1936",
      "duration": "87 MIN",
      "image": "https://...",
      "description": "Mistrovská satira na industriální věk",
      "country": "USA",
      "language": "Němý film s hudbou",
      "rating": 4.7,
      "reviewCount": 128,
      "awards": [
        "Nominace na Oscara za nejlepší hudbu",
        "Zařazen do National Film Registry (1989)"
      ],
      "showtimes": [
        {
          "id": "s1",
          "date": "2025-11-25",
          "time": "19:00",
          "available": true
        }
      ]
    }
  ]
}
```

**PHP příklad:**
```php
<?php
// /api/films/index.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$query = "
    SELECT 
        f.*,
        COUNT(DISTINCT r.id) as reviewCount,
        AVG(r.rating) as rating
    FROM films f
    LEFT JOIN reviews r ON f.id = r.film_id
    GROUP BY f.id
";

$result = $pdo->query($query);
$films = [];

while ($film = $result->fetch(PDO::FETCH_ASSOC)) {
    // Načtení promítání
    $showtimesQuery = $pdo->prepare("
        SELECT id, date, time, available 
        FROM showtimes 
        WHERE film_id = ? 
        AND date >= CURDATE()
        ORDER BY date, time
    ");
    $showtimesQuery->execute([$film['id']]);
    $film['showtimes'] = $showtimesQuery->fetchAll(PDO::FETCH_ASSOC);
    
    // Načtení ocenění
    $awardsQuery = $pdo->prepare("
        SELECT award_text 
        FROM awards 
        WHERE film_id = ?
    ");
    $awardsQuery->execute([$film['id']]);
    $film['awards'] = array_column($awardsQuery->fetchAll(PDO::FETCH_ASSOC), 'award_text');
    
    $films[] = $film;
}

echo json_encode(['films' => $films]);
?>
```

#### GET `/api/films/:id`
Detail konkrétního filmu.

**Response:**
```json
{
  "film": {
    "id": "1",
    "title": "MODERNÍ DOBA",
    ...
  }
}
```

**PHP příklad:**
```php
<?php
// /api/films/detail.php

$filmId = $_GET['id'] ?? null;

if (!$filmId) {
    http_response_code(400);
    echo json_encode(['error' => 'Film ID is required']);
    exit;
}

$query = $pdo->prepare("
    SELECT 
        f.*,
        COUNT(DISTINCT r.id) as reviewCount,
        AVG(r.rating) as rating
    FROM films f
    LEFT JOIN reviews r ON f.id = r.film_id
    WHERE f.id = ?
    GROUP BY f.id
");

$query->execute([$filmId]);
$film = $query->fetch(PDO::FETCH_ASSOC);

if (!$film) {
    http_response_code(404);
    echo json_encode(['error' => 'Film not found']);
    exit;
}

// Načtení promítání a ocenění (stejně jako výše)
// ...

echo json_encode(['film' => $film]);
?>
```

#### GET `/api/films/:filmId/showtimes`
Promítání konkrétního filmu.

**Response:**
```json
{
  "showtimes": [
    {
      "id": "s1",
      "date": "2025-11-25",
      "time": "19:00",
      "available": true
    }
  ]
}
```

### 2. Recenze

#### GET `/api/films/:filmId/reviews`
Všechny recenze filmu včetně odpovědí.

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "author": "Jan Novák",
      "rating": 5,
      "date": "2025-11-15",
      "text": "Výborný film!",
      "likes": 12,
      "dislikes": 1,
      "replies": [
        {
          "id": 101,
          "author": "Marie Svobodová",
          "date": "2025-11-16",
          "text": "Souhlasím!",
          "likes": 3,
          "dislikes": 0,
          "replies": []
        }
      ]
    }
  ]
}
```

**PHP příklad:**
```php
<?php
// /api/reviews/list.php

$filmId = $_GET['filmId'] ?? null;

function getReviewReplies($pdo, $reviewId, $parentReplyId = null) {
    $query = $pdo->prepare("
        SELECT * FROM review_replies 
        WHERE review_id = ? AND parent_reply_id " . 
        ($parentReplyId ? "= ?" : "IS NULL") . "
        ORDER BY created_at ASC
    ");
    
    $params = $parentReplyId ? [$reviewId, $parentReplyId] : [$reviewId];
    $query->execute($params);
    
    $replies = [];
    while ($reply = $query->fetch(PDO::FETCH_ASSOC)) {
        $reply['date'] = date('Y-m-d', strtotime($reply['created_at']));
        $reply['replies'] = getReviewReplies($pdo, $reviewId, $reply['id']);
        $replies[] = $reply;
    }
    
    return $replies;
}

$query = $pdo->prepare("
    SELECT * FROM reviews 
    WHERE film_id = ? 
    ORDER BY created_at DESC
");
$query->execute([$filmId]);

$reviews = [];
while ($review = $query->fetch(PDO::FETCH_ASSOC)) {
    $review['date'] = date('Y-m-d', strtotime($review['created_at']));
    $review['replies'] = getReviewReplies($pdo, $review['id']);
    $reviews[] = $review;
}

echo json_encode(['reviews' => $reviews]);
?>
```

#### POST `/api/films/:filmId/reviews`
Přidání nové recenze.

**Request:**
```json
{
  "rating": 5,
  "text": "Skvělý film!"
}
```

**Response:**
```json
{
  "review": {
    "id": 123,
    "author": "Jan Novák",
    "rating": 5,
    "text": "Skvělý film!",
    "likes": 0,
    "dislikes": 0,
    "date": "2025-11-20",
    "replies": []
  }
}
```

**PHP příklad:**
```php
<?php
// /api/reviews/create.php

$data = json_decode(file_get_contents('php://input'), true);
$filmId = $data['filmId'] ?? null;
$rating = $data['rating'] ?? null;
$text = $data['text'] ?? null;

// Získání uživatele z tokenu (nebo localStorage)
$userId = getCurrentUserId(); // implementujte podle vašeho auth systému
$user = getUserById($userId);
$author = $user['first_name'] . ' ' . $user['last_name'];

if (!$filmId || !$rating || !$text) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$query = $pdo->prepare("
    INSERT INTO reviews (film_id, user_id, author, rating, text) 
    VALUES (?, ?, ?, ?, ?)
");

$query->execute([$filmId, $userId, $author, $rating, $text]);
$reviewId = $pdo->lastInsertId();

// Načtení vytvořené recenze
$review = $pdo->prepare("SELECT * FROM reviews WHERE id = ?");
$review->execute([$reviewId]);
$newReview = $review->fetch(PDO::FETCH_ASSOC);
$newReview['date'] = date('Y-m-d', strtotime($newReview['created_at']));
$newReview['replies'] = [];

echo json_encode(['review' => $newReview]);
?>
```

#### POST `/api/reviews/:reviewId/like`
Lajknutí recenze.

**Response:**
```json
{
  "likes": 13
}
```

#### POST `/api/reviews/:reviewId/replies`
Přidání odpovědi na recenzi.

**Request:**
```json
{
  "text": "Souhlasím!",
  "parentReplyId": null
}
```

### 3. Autentizace

#### POST `/api/auth/login`
Přihlášení uživatele.

**Request:**
```json
{
  "email": "jan@email.cz",
  "password": "heslo123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "firstName": "Jan",
    "lastName": "Novák",
    "email": "jan@email.cz",
    "phone": "+420123456789",
    "gender": "male",
    "avatar": "base64...",
    "memberSince": "2025-01-01T00:00:00Z",
    "loyaltyPoints": 150
  },
  "token": "jwt-token-here"
}
```

**PHP příklad:**
```php
<?php
// /api/auth/login.php

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

$query = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$query->execute([$email]);
$user = $query->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// Generování JWT tokenu (použijte knihovnu jako firebase/php-jwt)
$token = generateJWT($user['id']);

unset($user['password']); // Neposílat heslo klientovi

echo json_encode([
    'user' => [
        'id' => $user['id'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'gender' => $user['gender'],
        'avatar' => $user['avatar'],
        'memberSince' => $user['member_since'],
        'loyaltyPoints' => $user['loyalty_points']
    ],
    'token' => $token
]);
?>
```

#### POST `/api/auth/register`
Registrace nového uživatele.

**Request:**
```json
{
  "firstName": "Jan",
  "lastName": "Novák",
  "email": "jan@email.cz",
  "phone": "+420123456789",
  "gender": "male",
  "password": "heslo123",
  "avatar": "base64..."
}
```

#### PUT `/api/auth/profile`
Aktualizace profilu uživatele (vyžaduje autentizaci).

### 4. Rezervace

#### POST `/api/reservations`
Vytvoření nové rezervace.

**Request:**
```json
{
  "filmId": "1",
  "showtimeId": "s1",
  "seats": ["A1", "A2", "A3"],
  "customerData": {
    "name": "Jan Novák",
    "email": "jan@email.cz",
    "phone": "+420123456789"
  }
}
```

**Response:**
```json
{
  "id": "r123",
  "ticketNumber": "456789",
  "status": "confirmed",
  "totalPrice": 540
}
```

**PHP příklad:**
```php
<?php
// /api/reservations/create.php

$data = json_decode(file_get_contents('php://input'), true);

$filmId = $data['filmId'];
$showtimeId = $data['showtimeId'];
$seats = $data['seats'];
$customerData = $data['customerData'];

$ticketNumber = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$pricePerSeat = 180;
$totalPrice = count($seats) * $pricePerSeat;

$pdo->beginTransaction();

try {
    // Vytvoření rezervace
    $query = $pdo->prepare("
        INSERT INTO reservations 
        (film_id, showtime_id, customer_name, customer_email, customer_phone, total_price, ticket_number, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
    ");
    
    $query->execute([
        $filmId,
        $showtimeId,
        $customerData['name'],
        $customerData['email'],
        $customerData['phone'],
        $totalPrice,
        $ticketNumber
    ]);
    
    $reservationId = $pdo->lastInsertId();
    
    // Uložení sedadel
    $seatQuery = $pdo->prepare("
        INSERT INTO reservation_seats (reservation_id, seat_id, price) 
        VALUES (?, ?, ?)
    ");
    
    foreach ($seats as $seat) {
        $seatQuery->execute([$reservationId, $seat, $pricePerSeat]);
    }
    
    $pdo->commit();
    
    echo json_encode([
        'id' => $reservationId,
        'ticketNumber' => $ticketNumber,
        'status' => 'confirmed',
        'totalPrice' => $totalPrice
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create reservation']);
}
?>
```

#### GET `/api/showtimes/:showtimeId/occupied-seats`
Obsazená sedadla pro dané promítání.

**Response:**
```json
{
  "occupiedSeats": ["A5", "B3", "B4", "C7"]
}
```

**PHP příklad:**
```php
<?php
// /api/showtimes/occupied-seats.php

$showtimeId = $_GET['showtimeId'] ?? null;

$query = $pdo->prepare("
    SELECT DISTINCT rs.seat_id
    FROM reservation_seats rs
    JOIN reservations r ON rs.reservation_id = r.id
    WHERE r.showtime_id = ? 
    AND r.status IN ('confirmed', 'paid')
");

$query->execute([$showtimeId]);
$seats = array_column($query->fetchAll(PDO::FETCH_ASSOC), 'seat_id');

echo json_encode(['occupiedSeats' => $seats]);
?>
```

## Error Handling

Všechny endpointy by měly vracet chyby v jednotném formátu:

```json
{
  "error": true,
  "message": "Chybová zpráva",
  "code": "ERROR_CODE"
}
```

**Běžné HTTP status kódy:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Best Practices

1. **Hesla**: Vždy použijte `password_hash()` a `password_verify()`
2. **SQL Injection**: Používejte prepared statements
3. **XSS**: Sanitizujte všechny vstupy
4. **CSRF**: Implementujte CSRF tokeny
5. **Rate Limiting**: Omezte počet requestů
6. **HTTPS**: Vždy používejte HTTPS v produkci

## Testing

Pro testování API můžete použít nástroje jako:
- Postman
- Insomnia
- cURL

Příklad cURL:
```bash
curl -X POST http://localhost/api/films/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"rating": 5, "text": "Skvělý film!"}'
```
