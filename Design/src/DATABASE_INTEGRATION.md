# Dokumentace pro databázové napojení

Tento dokument popisuje, jak jsou komponenty připraveny pro napojení na databázi přes API.

## Struktura API vrstvy

Všechny API volání jsou centralizovány v `/api` složce:

- `/api/config.ts` - Konfigurace API (BASE_URL, endpoints, mock data switch)
- `/api/films.ts` - API pro filmy
- `/api/reviews.ts` - API pro recenze a odpovědi
- `/api/auth.ts` - API pro autentizaci
- `/api/bookings.ts` - API pro rezervace

## Přepínání mezi Mock daty a skutečným API

V souboru `/api/config.ts` nastavte:

```typescript
export const USE_MOCK_DATA = false; // true = mock data, false = skutečné API
export const API_BASE_URL = 'https://your-api-url.com/api';
```

## Databázové modely a endpointy

### 1. Filmy (Films)

**Databázová tabulka: `films`**

Sloupce:
- `id` (int/string, primary key)
- `title` (string)
- `subtitle` (string)
- `year` (int)
- `duration` (string)
- `image` (string - URL)
- `description` (text)
- `rating` (decimal)
- `reviewCount` (int)
- `country` (string, nullable)
- `language` (string, nullable)
- `awards` (JSON/text, nullable)
- `featured` (boolean)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Endpointy:**
- `GET /api/films` - Seznam všech filmů
- `GET /api/films/:id` - Detail filmu
- `GET /api/films/featured` - Doporučené filmy

**Příklad PHP API odpovědi:**
```json
{
  "id": "1",
  "title": "Modern Times",
  "subtitle": "Moderní doba",
  "year": 1936,
  "duration": "87 min",
  "image": "https://...",
  "description": "...",
  "rating": 4.8,
  "reviewCount": 42,
  "country": "USA",
  "language": "Němý film",
  "awards": ["Oscar 1937", "..."],
  "showtimes": [...]
}
```

### 2. Představení (Showtimes)

**Databázová tabulka: `showtimes`**

Sloupce:
- `id` (int, primary key)
- `filmId` (int, foreign key -> films.id)
- `date` (date)
- `time` (time)
- `availableSeats` (int)
- `totalSeats` (int)
- `createdAt` (datetime)

**Relace:**
- Film má mnoho představení (1:N)

**Endpoint:** Zahrnuto v `/api/films/:id`

### 3. Recenze (Reviews)

**Databázová tabulka: `reviews`**

Sloupce:
- `id` (int, primary key)
- `filmId` (int, foreign key -> films.id)
- `userId` (int, foreign key -> users.id, nullable)
- `author` (string)
- `rating` (int, 1-5)
- `text` (text)
- `likes` (int, default 0)
- `dislikes` (int, default 0)
- `date` (date)
- `createdAt` (datetime)

**Endpointy:**
- `GET /api/films/:filmId/reviews` - Seznam recenzí pro film
- `POST /api/films/:filmId/reviews` - Přidání recenze

**POST request body:**
```json
{
  "rating": 5,
  "text": "Skvělý film!"
}
```

### 4. Odpovědi na recenze (Replies)

**Databázová tabulka: `replies`**

Sloupce:
- `id` (int, primary key)
- `reviewId` (int, foreign key -> reviews.id)
- `parentReplyId` (int, foreign key -> replies.id, nullable) - pro vnořené odpovědi
- `userId` (int, foreign key -> users.id, nullable)
- `author` (string)
- `text` (text)
- `likes` (int, default 0)
- `dislikes` (int, default 0)
- `date` (date)
- `createdAt` (datetime)

**Relace:**
- Recenze má mnoho odpovědí (1:N)
- Odpověď může mít mnoho vnořených odpovědí (1:N self-reference)

**Endpointy:**
- `POST /api/reviews/:reviewId/replies` - Přidání odpovědi

**POST request body:**
```json
{
  "text": "Souhlasím!",
  "parentReplyId": null  // nebo ID rodičovské odpovědi pro vnořené odpovědi
}
```

### 5. Uživatelé (Users)

**Databázová tabulka: `users`**

Sloupce:
- `id` (int, primary key)
- `email` (string, unique)
- `password` (string, hashed)
- `firstName` (string)
- `lastName` (string)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Endpointy:**
- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/logout` - Odhlášení
- `GET /api/auth/me` - Aktuální uživatel

**POST /api/auth/register body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Jan",
  "lastName": "Novák"
}
```

**Odpověď:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Novák"
  },
  "token": "jwt-token-here"
}
```

### 6. Rezervace (Bookings)

**Databázová tabulka: `bookings`**

Sloupce:
- `id` (int, primary key)
- `showtimeId` (int, foreign key -> showtimes.id)
- `userId` (int, foreign key -> users.id, nullable)
- `customerName` (string)
- `customerEmail` (string)
- `customerPhone` (string)
- `seats` (JSON) - pole sedadel ["A1", "A2"]
- `totalPrice` (decimal)
- `status` (enum: 'pending', 'paid', 'cancelled')
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Endpointy:**
- `GET /api/showtimes/:id/seats` - Dostupná sedadla
- `POST /api/bookings` - Vytvoření rezervace
- `GET /api/bookings/:id` - Detail rezervace
- `POST /api/bookings/:id/payment` - Platba

**POST /api/bookings body:**
```json
{
  "showtimeId": 1,
  "customerName": "Jan Novák",
  "customerEmail": "jan@example.com",
  "customerPhone": "+420123456789",
  "seats": ["A1", "A2"],
  "totalPrice": 360
}
```

## Autentizace

Aplikace používá JWT tokeny pro autentizaci:

1. **Registrace/Přihlášení** - Server vrátí JWT token
2. **Uložení tokenu** - Token se uloží do localStorage
3. **API requesty** - Token se přidává do hlavičky `Authorization: Bearer <token>`

V souboru `/api/config.ts` je funkce `getApiHeaders()`, která automaticky přidává token.

## Příklad PHP API implementace

### Film Detail (GET /api/films/:id)

```php
<?php
header('Content-Type: application/json');

$filmId = $_GET['id'];

// Database connection
$pdo = new PDO('mysql:host=localhost;dbname=kino', 'user', 'password');

// Get film
$stmt = $pdo->prepare('SELECT * FROM films WHERE id = ?');
$stmt->execute([$filmId]);
$film = $stmt->fetch(PDO::FETCH_ASSOC);

// Get showtimes
$stmt = $pdo->prepare('SELECT * FROM showtimes WHERE filmId = ? ORDER BY date, time');
$stmt->execute([$filmId]);
$showtimes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$film['showtimes'] = $showtimes;
$film['awards'] = json_decode($film['awards']);

echo json_encode($film);
```

### Přidání recenze (POST /api/films/:filmId/reviews)

```php
<?php
header('Content-Type: application/json');

$filmId = $_POST['filmId'];
$data = json_decode(file_get_contents('php://input'), true);

// Get user from JWT token
$token = getBearerToken();
$user = validateJWTToken($token);

$pdo = new PDO('mysql:host=localhost;dbname=kino', 'user', 'password');

$stmt = $pdo->prepare('
  INSERT INTO reviews (filmId, userId, author, rating, text, date, likes, dislikes)
  VALUES (?, ?, ?, ?, ?, NOW(), 0, 0)
');

$author = $user ? "{$user['firstName']} {$user['lastName']}" : 'Anonym';

$stmt->execute([
  $filmId,
  $user['id'] ?? null,
  $author,
  $data['rating'],
  $data['text']
]);

$reviewId = $pdo->lastInsertId();

// Return created review
$stmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ?');
$stmt->execute([$reviewId]);
$review = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($review);
```

## Migrace databáze

### SQL schema:

```sql
-- Films
CREATE TABLE films (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  year INT NOT NULL,
  duration VARCHAR(50),
  image TEXT,
  description TEXT,
  rating DECIMAL(2,1),
  reviewCount INT DEFAULT 0,
  country VARCHAR(100),
  language VARCHAR(100),
  awards JSON,
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Showtimes
CREATE TABLE showtimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filmId INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  availableSeats INT NOT NULL,
  totalSeats INT NOT NULL DEFAULT 80,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filmId) REFERENCES films(id) ON DELETE CASCADE
);

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filmId INT NOT NULL,
  userId INT,
  author VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filmId) REFERENCES films(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Replies
CREATE TABLE replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reviewId INT NOT NULL,
  parentReplyId INT,
  userId INT,
  author VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (parentReplyId) REFERENCES replies(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  showtimeId INT NOT NULL,
  userId INT,
  customerName VARCHAR(255) NOT NULL,
  customerEmail VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(50),
  seats JSON NOT NULL,
  totalPrice DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (showtimeId) REFERENCES showtimes(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_showtimes_film ON showtimes(filmId);
CREATE INDEX idx_reviews_film ON reviews(filmId);
CREATE INDEX idx_replies_review ON replies(reviewId);
CREATE INDEX idx_bookings_showtime ON bookings(showtimeId);
```

## Testování API

1. Nastavte `USE_MOCK_DATA = false` v `/api/config.ts`
2. Nastavte správnou `API_BASE_URL`
3. Implementujte PHP endpointy podle dokumentace výše
4. Všechny komponenty automaticky začnou používat skutečné API

## Bezpečnost

- **Hesla**: Hashujte pomocí `password_hash()` v PHP
- **JWT tokeny**: Používejte knihovnu jako `firebase/php-jwt`
- **SQL Injection**: Používejte prepared statements
- **CORS**: Nastavte správné CORS hlavičky na serveru
- **Validace**: Validujte všechny vstupy na straně serveru

## Komponenty připravené pro databázové napojení

Všechny komponenty v aplikaci jsou navrženy tak, aby fungovaly s databází:

✅ **Filmy** - `/api/films.ts` - Načítání filmů z databáze  
✅ **Představení** - Součást filmů - Showtime management  
✅ **Recenze** - `/api/reviews.ts` - CRUD operace s recenzemi  
✅ **Odpovědi na recenze** - `/api/reviews.ts` - Včetně vnořených odpovědí  
✅ **Autentizace** - `/api/auth.ts` - Register/Login/Logout  
✅ **Rezervace** - `/api/bookings.ts` - Kompletní booking flow  
✅ **Uživatelé** - `/api/auth.ts` - User management  

Stačí implementovat PHP API endpointy a změnit konfiguraci!
