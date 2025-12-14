import { Film, Showtime } from '../types';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';

// DB tvar z backendu
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

// fallback obrázek (než budeš mít v DB sloupec s posterem)
const fallbackImage =
  'https://images.unsplash.com/photo-1489599735734-79b4d4c4b5c8?ixlib=rb-4.1.0&q=80&w=1080';

function mapDbFilmToUi(row: FilmDbRow): Film {
  return {
    id: String(row.id),
    title: row.title,
    // UI teď používá subtitle jako “režisér” (lepší než mít prázdné)
    subtitle: row.director,
    year: String(row.year),
    duration: `${row.length_min} MIN`,
    image: fallbackImage,

    description: row.description,
    country: row.country,
    language: row.language,

    // FilmCard čeká awards jako string[] (u tebe v mocku)
    awards: row.awards ? row.awards.split(',').map(s => s.trim()).filter(Boolean) : [],

    // rating / reviewCount používáš v mocku, tak ať to UI má
    rating: Number(row.avg_rating) || 0,
    reviewCount: 0,

    // showtimes zatím nemáš napojené → nech prázdné
    showtimes: [] as Showtime[],
  };
}

export const getFilms = async (): Promise<Film[]> => {
  if (USE_MOCK_DATA) {
    // necháš-li mock, vrať mock (nebo ho smaž)
    return [];
  }

  const rows = (await apiFetch(API_ENDPOINTS.FILMS)) as FilmDbRow[];
  return rows.map(mapDbFilmToUi);
};

// zatím bez backendu pro detail → jednoduše dohledáme ve všech filmech
export const getFilmById = async (id: string): Promise<Film | null> => {
  const films = await getFilms();
  return films.find(f => f.id === id) || null;
};

// showtimes zatím nemáš implementované v PHP → prázdné
export const getFilmShowtimes = async (_filmId: string): Promise<Showtime[]> => {
  return [];
};
