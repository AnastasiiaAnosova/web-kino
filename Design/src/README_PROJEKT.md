# Graphite Kinematograf - React + TypeScript

Tento projekt je kompletní převod původního HTML/JS projektu kinematografu do React s TypeScript, připravený pro integraci s PHP API.

## Struktura projektu

```
/
├── api/                    # API vrstva pro komunikaci s backendem
│   ├── config.ts          # Konfigurace API (URL, endpointy)
│   ├── films.ts           # API pro filmy
│   ├── auth.ts            # API pro autentizaci
│   ├── reviews.ts         # API pro recenze
│   └── reservations.ts    # API pro rezervace
├── components/            # React komponenty
│   ├── layout/           # Header, Footer, DecorativeCurtain
│   ├── films/            # FilmCard, FilmGrid
│   ├── home/             # HeroSection, FeaturedFilm, AboutSection
│   ├── auth/             # AuthModal, ProfileModal
│   ├── reviews/          # ReviewForm, ReviewItem
│   └── reservation/      # SeatMap, ReservationSummary
├── pages/                 # Hlavní stránky aplikace
│   ├── Home.tsx
│   ├── FilmDetail.tsx
│   ├── Reservation.tsx
│   ├── Payment.tsx
│   └── Register.tsx
├── hooks/                 # Custom React hooks
│   ├── useFilms.ts
│   └── useAuth.ts
├── types/                 # TypeScript typy
│   └── index.ts
└── styles/               # Globální styly
    └── globals.css

```

## Instalace

1. **Nainstalujte závislosti:**
```bash
npm install
```

2. **Nainstalujte dodatečné závislosti:**
```bash
npm install react-router-dom lucide-react
```

## Konfigurace API

### Vývojové prostředí (Mock data)

Pro vývoj bez PHP backendu nastavte proměnnou prostředí:

```bash
# .env.local
REACT_APP_USE_MOCK=true
```

V tomto režimu aplikace používá mock data z `/api/films.ts`.

### Produkční prostředí (PHP API)

1. **Nastavte URL vašeho PHP API:**

```bash
# .env.production
REACT_APP_USE_MOCK=false
REACT_APP_API_URL=https://vase-domena.cz/api
```

2. **Struktura PHP API endpointů:**

Aplikace očekává následující endpointy (definované v `/api/config.ts`):

#### Filmy
- `GET /api/films` - Načtení všech filmů
- `GET /api/films/:id` - Detail filmu
- `GET /api/films/:filmId/showtimes` - Promítání filmu

#### Recenze
- `GET /api/films/:filmId/reviews` - Recenze filmu
- `POST /api/films/:filmId/reviews` - Přidání recenze
- `POST /api/reviews/:reviewId/like` - Lajknutí recenze
- `POST /api/reviews/:reviewId/dislike` - Dislajknutí recenze
- `POST /api/reviews/:reviewId/replies` - Přidání odpovědi

#### Autentizace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/register` - Registrace
- `POST /api/auth/logout` - Odhlášení
- `GET /api/auth/profile` - Profil uživatele
- `PUT /api/auth/profile` - Aktualizace profilu

#### Rezervace
- `POST /api/reservations` - Vytvoření rezervace
- `GET /api/reservations/:id` - Detail rezervace
- `GET /api/showtimes/:showtimeId/occupied-seats` - Obsazená sedadla

### Příklad PHP API Response

#### GET /api/films
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
      "description": "Mistrovská satira...",
      "country": "USA",
      "language": "Němý film s hudbou",
      "awards": ["..."],
      "rating": 4.7,
      "reviewCount": 128,
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

#### POST /api/reservations
```json
// Request
{
  "filmId": "1",
  "showtimeId": "s1",
  "seats": ["A1", "A2"],
  "customerData": {
    "name": "Jan Novák",
    "email": "jan@email.cz",
    "phone": "+420123456789"
  }
}

// Response
{
  "id": "r123",
  "ticketNumber": "123456",
  "status": "confirmed"
}
```

## Spuštění

### Vývojový server
```bash
npm run dev
```

Aplikace bude dostupná na `http://localhost:3000`

### Produkční build
```bash
npm run build
```

## Klíčové vlastnosti

### 1. **Plná integrace s databází**
- Všechna data filmů se načítají z API
- Mock data slouží pouze pro vývoj
- Fallback mechanismus při chybě API

### 2. **TypeScript typy**
- Kompletní typová bezpečnost
- Definované typy pro Film, Review, User, Booking
- IntelliSense podpora

### 3. **React Router**
- SPA navigace
- Dynamic routes (`/film/:id`)
- History API

### 4. **State management**
- React hooks (useState, useEffect)
- Custom hooks (useFilms, useAuth)
- SessionStorage pro booking flow
- LocalStorage pro uživatelská data

### 5. **Responsivní design**
- Mobile-first přístup
- Tailwind CSS utilities
- Custom CSS proměnné

## Integrace s PHP backendem

### CORS nastavení

Ujistěte se, že váš PHP backend povoluje CORS requesty:

```php
<?php
// V hlavním PHP souboru
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### Autentizace

Aplikace používá localStorage pro ukládání user dat. Pro produkci doporučujeme:

1. JWT tokeny místo plain text hesel
2. HTTP-only cookies pro refresh tokeny
3. Secure HTTPS spojení

Upravte `/api/config.ts`:

```typescript
export const getApiHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
```

### Error handling

Aplikace má centralizovaný error handling v `/api/config.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}
```

PHP backend by měl vracet chyby ve formátu:

```json
{
  "error": true,
  "message": "Chybová zpráva",
  "code": "ERROR_CODE"
}
```

## Dalších úpravy

### Přidání nového API endpointu

1. Přidejte endpoint do `/api/config.ts`:
```typescript
export const API_ENDPOINTS = {
  // ...
  NEW_ENDPOINT: '/new-endpoint',
};
```

2. Vytvořte API funkci (např. v `/api/films.ts`):
```typescript
export const getNewData = async (): Promise<DataType> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NEW_ENDPOINT}`);
  if (!response.ok) return handleApiError(response);
  return response.json();
};
```

3. Použijte v komponentě:
```typescript
import { getNewData } from '../api/films';

const [data, setData] = useState(null);

useEffect(() => {
  const loadData = async () => {
    const result = await getNewData();
    setData(result);
  };
  loadData();
}, []);
```

## Testování

### Testování s mock daty
```bash
REACT_APP_USE_MOCK=true npm run dev
```

### Testování s API
```bash
REACT_APP_USE_MOCK=false REACT_APP_API_URL=http://localhost:8000/api npm run dev
```

## Deployment

1. **Build projektu:**
```bash
npm run build
```

2. **Deploy build složky:**
- Zkopírujte obsah `build/` nebo `dist/` na server
- Nastavte web server pro SPA routing (všechny requesty → index.html)

### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Troubleshooting

### Problémy s API
- Zkontrolujte CORS nastavení
- Ověřte URL v `.env`
- Zkontrolujte network tab v DevTools
- Povolte mock mode pro testování frontend bez backendu

### Chyby buildu
- Smažte `node_modules` a reinstalujte: `rm -rf node_modules && npm install`
- Vyčistěte cache: `npm cache clean --force`

### TypeScript chyby
- Zkontrolujte importy
- Ověřte typy v `/types/index.ts`
- Použijte `any` jako dočasné řešení (pak refaktorujte)

## Kontakt

Pro otázky k projektu kontaktujte vývojový tým.
