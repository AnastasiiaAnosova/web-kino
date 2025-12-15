import { Film, Showtime, Screening } from '../types';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';
import { FILM_POSTERS_BY_ID, FALLBACK_POSTER } from './filmPosters';

type FilmDbRow = {
  id: number;
  title: string;
  director: string;
  year: number;
  country: string;
  language: string;
  description: string;
  length_min: number;
  age_limit: number;
  genre: string;
  awards: string | null;
  avg_rating: string;
};

async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(`${res.status} ${msg}`);
  }

  return res.json();
}

function mapDbFilmToUi(row: FilmDbRow): Film {
  return {
    id: String(row.id),
    title: row.title,
    subtitle: row.director,
    year: String(row.year),
    duration: `${row.length_min} MIN`,
    image: FILM_POSTERS_BY_ID[row.id] ?? FALLBACK_POSTER,

    description: row.description,
    country: row.country,
    language: row.language,

    awards: row.awards ? row.awards.split(',').map(s => s.trim()).filter(Boolean) : [],
    rating: Number(row.avg_rating) || 0,
    reviewCount: 0,
    showtimes: [] as Showtime[],
  };
}

export const getFilms = async (): Promise<Film[]> => {
  if (USE_MOCK_DATA) return []; // nebo throw new Error(...)
  const rows = (await apiFetch(API_ENDPOINTS.FILMS)) as FilmDbRow[];
  return rows.map(mapDbFilmToUi);
};

export const getFilmById = async (id: string): Promise<Film | null> => {
  const films = await getFilms();
  return films.find(f => f.id === id) || null;
};

export const getFilmShowtimes = async (filmId: string): Promise<Showtime[]> => {
  if (USE_MOCK_DATA) return [];

  const rows = (await apiFetch(API_ENDPOINTS.SHOWTIMES(filmId))) as Screening[];

  // map DB → UI Showtime
  return rows.map((r) => ({
    id: String(r.id),
    date: r.date,
    time: r.time,
    available: true,
    price: r.cena,
    hallId: r.id_sal,
  }));
}