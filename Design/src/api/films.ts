import { Film, Showtime } from '../types';
import { API_BASE_URL, API_ENDPOINTS, getApiHeaders, handleApiError, USE_MOCK_DATA } from './config';

// Mock data pro vývoj
const mockFilms: Film[] = [
  {
    id: '1',
    title: 'MODERNÍ DOBA',
    subtitle: 'CHARLES CHAPLIN',
    year: '1936',
    duration: '87 MIN',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c8?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's1', date: '2025-11-25', time: '19:00', available: true },
      { id: 's2', date: '2025-11-25', time: '21:30', available: true },
      { id: 's3', date: '2025-11-26', time: '19:00', available: true },
      { id: 's4', date: '2025-11-26', time: '21:30', available: true }
    ],
    description: 'Mistrovská satira na industriální věk',
    country: 'USA',
    language: 'Němý film s hudbou',
    awards: [
      'Nominace na Oscara za nejlepší hudbu',
      'Zařazen do National Film Registry (1989)',
      'Umístěn mezi 100 nejlepších amerických filmů AFI'
    ],
    rating: 4.7,
    reviewCount: 128
  },
  {
    id: '2',
    title: 'ÚSVIT',
    subtitle: 'F.W. MURNAU',
    year: '1927',
    duration: '94 MIN',
    image: 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's5', date: '2025-11-25', time: '17:00', available: true },
      { id: 's6', date: '2025-11-25', time: '20:00', available: true },
      { id: 's7', date: '2025-11-26', time: '17:00', available: true }
    ],
    description: 'Poetické drama o lásce a vykoupení',
    country: 'USA',
    language: 'Němý film s hudbou'
  },
  {
    id: '3',
    title: 'METROPOLIS',
    subtitle: 'FRITZ LANG',
    year: '1927',
    duration: '148 MIN',
    image: 'https://images.unsplash.com/photo-1587555009307-4b73aaab7d9c?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's8', date: '2025-11-25', time: '18:30', available: true },
      { id: 's9', date: '2025-11-26', time: '18:30', available: true }
    ],
    description: 'Futuristická vize společnosti',
    country: 'Německo',
    language: 'Němý film s hudbou'
  },
  {
    id: '4',
    title: 'DR. CALIGARI',
    subtitle: 'ROBERT WIENE',
    year: '1920',
    duration: '76 MIN',
    image: 'https://images.unsplash.com/photo-1701977130396-87d72a51e843?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's10', date: '2025-11-25', time: '19:30', available: true },
      { id: 's11', date: '2025-11-25', time: '22:00', available: true },
      { id: 's12', date: '2025-11-26', time: '19:30', available: true }
    ],
    description: 'Klasika německého expresionismu',
    country: 'Německo',
    language: 'Němý film s hudbou'
  },
  {
    id: '5',
    title: 'NOSFERATU',
    subtitle: 'F.W. MURNAU',
    year: '1922',
    duration: '94 MIN',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's13', date: '2025-11-25', time: '20:00', available: true },
      { id: 's14', date: '2025-11-26', time: '20:00', available: true }
    ],
    description: 'První filmová adaptace Drákuly',
    country: 'Německo',
    language: 'Němý film s hudbou'
  },
  {
    id: '6',
    title: 'THE KID',
    subtitle: 'CHARLES CHAPLIN',
    year: '1921',
    duration: '68 MIN',
    image: 'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c8?ixlib=rb-4.1.0&q=80&w=1080',
    showtimes: [
      { id: 's15', date: '2025-11-25', time: '17:30', available: true },
      { id: 's16', date: '2025-11-26', time: '20:30', available: true }
    ],
    description: 'Dobrodružství tuláka a sirotka',
    country: 'USA',
    language: 'Němý film s hudbou'
  },
  {
    id: '7',
    title: 'THE JAZZ SINGER',
    subtitle: 'ALAN CROSLAND',
    year: '1927',
    duration: '88 MIN',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080',
    showtimes: [
      { id: 's17', date: '2025-11-25', time: '19:00', available: true },
      { id: 's18', date: '2025-11-26', time: '21:00', available: true }
    ],
    description: 'První zvukový film v historii',
    country: 'USA',
    language: 'Angličtina'
  },
  {
    id: '8',
    title: 'THE GENERAL',
    subtitle: 'BUSTER KEATON',
    year: '1926',
    duration: '67 MIN',
    image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1080',
    showtimes: [
      { id: 's19', date: '2025-11-25', time: '18:00', available: true },
      { id: 's20', date: '2025-11-26', time: '19:00', available: true }
    ],
    description: 'Komedie o vlaku a občanské válce',
    country: 'USA',
    language: 'Němý film s hudbou'
  }
];

/**
 * Načtení všech filmů z databáze
 */
export const getFilms = async (): Promise<Film[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockFilms;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FILMS}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.films || data;
  } catch (error) {
    console.error('Error fetching films:', error);
    // Fallback na mock data při chybě
    return mockFilms;
  }
};

/**
 * Načtení detailu filmu podle ID
 */
export const getFilmById = async (id: string): Promise<Film | null> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockFilms.find(film => film.id === id) || null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FILM_BY_ID(id)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.film || data;
  } catch (error) {
    console.error('Error fetching film:', error);
    // Fallback na mock data
    return mockFilms.find(film => film.id === id) || null;
  }
};

/**
 * Načtení promítání pro konkrétní film
 */
export const getFilmShowtimes = async (filmId: string): Promise<Showtime[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const film = mockFilms.find(f => f.id === filmId);
    return film?.showtimes || [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SHOWTIMES(filmId)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.showtimes || data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    const film = mockFilms.find(f => f.id === filmId);
    return film?.showtimes || [];
  }
};