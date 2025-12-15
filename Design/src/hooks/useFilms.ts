import { useState, useEffect } from 'react';
import { Film } from '../types';
import { getFilms, getFilmById, getFilmShowtimes } from '../api/films';
import type { Showtime } from '../types';

export const useFilms = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true);
        const data = await getFilms();
        const filmsWithTimes = await Promise.all(
          data.map(async (f) => {
            try {
              const showtimes = await getFilmShowtimes(f.id);
              return { ...f, showtimes };
            } catch {
              return { ...f, showtimes: [] as Showtime[] };
            }
          })
        );
        setFilms(filmsWithTimes);
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
        if (!data) {
          setFilm(null);
          return;
        }

        let showtimes: Showtime[] = [];
        try {
          showtimes = await getFilmShowtimes(data.id);
        } catch {
          showtimes = [];
        }
        setFilm({ ...data, showtimes });
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
