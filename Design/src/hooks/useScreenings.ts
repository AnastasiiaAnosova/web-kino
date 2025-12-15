import { useEffect, useState } from 'react';
import { Showtime } from '../types';
import { getFilmShowtimes } from '../api/films';

export const useScreenings = (filmId: string | null) => {
  const [screenings, setScreenings] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filmId) {
      setScreenings([]);
      return;
    }

    setLoading(true);
    getFilmShowtimes(filmId)
      .then(setScreenings)
      .finally(() => setLoading(false));
  }, [filmId]);

  return { screenings, loading };
};
