import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Film } from '../../types';

interface FilmCardProps {
  film: Film;
  onBookClick?: (filmId: string) => void;
}

export const FilmCard = ({ film, onBookClick }: FilmCardProps) => {
  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookClick) {
      onBookClick(film.id);
    }
  };

  return (
    <div className="relative bg-white border-2 border-black overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
      <div className="absolute -top-1 -left-1 w-16 h-16 border-t-2 border-l-2 border-black opacity-20" />
      <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-2 border-r-2 border-black opacity-20" />
      
      {/* Film poster */}
      <Link to={`/film/${film.id}`}>
        <div className="relative overflow-hidden border-b-2 border-black group">
          <img
            src={film.image}
            alt={film.title}
            className="w-full h-64 object-cover grayscale group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
      
      <div className="p-6">
        <div className="mb-4">
          <Link 
            to={`/film/${film.id}`}
            className="no-underline"
          >
            <h3 className="font-display text-lg tracking-wider mb-1 hover:text-[#912D3C] transition-colors cursor-pointer">
              {film.title}
            </h3>
          </Link>
          
          <h4 className="font-display text-base text-[#912D3C] mb-3">
            {film.subtitle}
          </h4>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 font-display">
            <span>{film.year}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={2} />
              {film.duration}
            </span>
          </div>

          {/* <p className="font-serif text-sm text-gray-700 mb-4">
            {film.description}
          </p> */}

          {/* Showtimes */}
          {film.showtimes && film.showtimes.length > 0 && (
            <div className="flex gap-2 mb-4">
              {film.showtimes.slice(0, 2).map((showtime) => (
                <span 
                  key={showtime.id}
                  className="px-3 py-1 bg-black text-white font-display text-xs tracking-wider"
                >
                  {showtime.time}
                </span>
              ))}
            </div>
          )}

          {/* Book button */}
          <button
            onClick={handleBookClick}
            className="w-full py-3 bg-[#912D3C] text-white font-display text-xs tracking-wider hover:bg-[#A43D4C] transition-colors border-2 border-black shadow-md hover:shadow-lg"
          >
            REZERVOVAT
          </button>
        </div>
      </div>
    </div>
  );
};