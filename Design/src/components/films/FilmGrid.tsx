import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Film } from '../../types';
import { FilmCard } from './FilmCard';

interface FilmGridProps {
  films: Film[];
  onBookClick?: (filmId: string) => void;
}

export const FilmGrid = ({ films, onBookClick }: FilmGridProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const displayedFilms = showAll ? films : films.slice(0, 3);

  return (
    <section id="program" className="py-16 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl tracking-wider mb-4">TENTO TÝDEN</h2>
          <div className="w-24 h-1 bg-[#912D3C] mx-auto mb-6" />
          <p className="font-serif text-gray-700 max-w-2xl mx-auto">
            Pečlivě vybraný program klasických děl němého filmu v původní atmosféře
          </p>
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {displayedFilms.map((film) => (
            <FilmCard 
              key={film.id} 
              film={film}
              onBookClick={onBookClick}
            />
          ))}
        </div>

        {/* Show more button */}
        {films.length > 3 && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#912D3C] text-white font-display text-sm tracking-wider hover:bg-[#A43D4C] transition-colors shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-4 h-4" strokeWidth={2} />
              {showAll ? 'ZOBRAZIT MÉNĚ' : 'CELÝ PROGRAM'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};