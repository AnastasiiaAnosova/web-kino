// src/api/config.ts
export const USE_MOCK_DATA = false;

// když použiješ Vite proxy, BASE_URL je prázdné
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  CSRF: '/api/csrf.php',
  LOGIN: '/api/login.php',
  REGISTER: '/api/register.php',
  LOGOUT: '/api/logout.php',

  FILMS: '/api/films.php',
  SHOWTIMES: (filmId: string) => `/api/screenings.php?film_id=${filmId}`,
  SEATS: (promitnutiId: string) => `/api/seats.php?promitnuti_id=${promitnutiId}`,
  RESERVE_GUEST: '/api/reserve_guest.php',
} as const;

export const getApiHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  const data = await response.json().catch(() => ({}));
  throw new ApiError(
    response.status,
    data.error || data.message || response.statusText,
    data
  );
};
