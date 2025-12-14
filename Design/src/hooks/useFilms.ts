import { useState, useEffect } from 'react';
import { Film } from '../types';
import { getFilms, getFilmById } from '../api/films';

export const useFilms = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true);
        const data = await getFilms();
        setFilms(data);
        setError(null);
      } catch (err) {
        setError('Nepodařilo se načíst filmy');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  return { films, loading, error };
};

export const useFilm = (filmId: string | undefined) => {
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filmId) {
      setLoading(false);
      return;
    }

    const fetchFilm = async () => {
      try {
        setLoading(true);
        const data = await getFilmById(filmId);
        setFilm(data || null);
        setError(null);
      } catch (err) {
        setError('Nepodařilo se načíst detail filmu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilm();
  }, [filmId]);

  return { film, loading, error };
};
