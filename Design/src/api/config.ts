// API Configuration
// Nastavte USE_MOCK_DATA na false, až budete připraveni použít skutečné PHP API
export const USE_MOCK_DATA = true; // Změňte na false pro produkční API

// V produkci nahradit skutečnou URL vašeho PHP API
export const API_BASE_URL = 'http://localhost/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Films
  FILMS: '/films',
  FILM_BY_ID: (id: string) => `/films/${id}`,
  
  // Reviews
  REVIEWS: (filmId: string) => `/films/${filmId}/reviews`,
  ADD_REVIEW: (filmId: string) => `/films/${filmId}/reviews`,
  LIKE_REVIEW: (reviewId: number) => `/reviews/${reviewId}/like`,
  DISLIKE_REVIEW: (reviewId: number) => `/reviews/${reviewId}/dislike`,
  ADD_REPLY: (reviewId: number) => `/reviews/${reviewId}/replies`,
  
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  
  // Reservations
  CREATE_RESERVATION: '/reservations',
  GET_RESERVATION: (id: string) => `/reservations/${id}`,
  GET_OCCUPIED_SEATS: (showtimeId: string) => `/showtimes/${showtimeId}/occupied-seats`,
  
  // Showtimes
  SHOWTIMES: (filmId: string) => `/films/${filmId}/showtimes`,
} as const;

// API Headers
export const getApiHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      // V produkci použít JWT token místo přímého hesla
      headers['Authorization'] = `Bearer ${userData.email}:${userData.password}`;
    }
  }
  
  return headers;
};

// API Error Handler
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  const data = await response.json().catch(() => ({}));
  throw new ApiError(
    response.status,
    data.message || 'Došlo k chybě při komunikaci se serverem',
    data
  );
};