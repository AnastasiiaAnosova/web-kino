import { Clock, User, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Film } from '../../types';

interface FeaturedFilmProps {
  film: Film;
  onBookClick?: () => void;
}

export const FeaturedFilm = ({ film, onBookClick }: FeaturedFilmProps) => {
  const navigate = useNavigate();

  const handleFilmClick = () => {
    navigate(`/film/${film.id}`);
  };

  return (
    <section className="relative bg-black text-white py-16 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${film.image})` }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl tracking-wider mb-4">DNES VEČER</h2>
          <div className="w-24 h-1 bg-[#912D3C] mx-auto" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#912D3C] to-black transform rotate-2 shadow-2xl" />
            
            <div className="relative bg-gradient-to-r from-[#111] via-black to-[#111] border-4 border-[#912D3C] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Info */}
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-1 h-32 bg-[#912D3C]" />
                    <div>
                      <h3 
                        onClick={handleFilmClick}
                        className="font-display text-3xl tracking-wider mb-2 cursor-pointer hover:text-[#912D3C] transition-colors"
                      >
                        {film.title}
                      </h3>
                      <h4 className="font-display text-xl text-[#912D3C]">{film.subtitle}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4 text-sm text-gray-400">
                    <span>{film.year}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" strokeWidth={2} />
                      {film.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" strokeWidth={2} />
                      {film.subtitle}
                    </span>
                  </div>

                  <p className="font-serif text-gray-300 mb-6">{film.description}</p>

                  {/* Showtimes */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Clock className="w-4 h-4 text-[#912D3C]" strokeWidth={2} />
                      <span>DNES VEČER:</span>
                    </div>
                    <div className="flex gap-4">
                      {film.showtimes?.slice(0, 2).map((showtime) => (
                        <div key={showtime.id} className="relative">
                          <div className="absolute inset-0 bg-[#912D3C] transform rotate-2" />
                          <span className="relative block bg-white text-black border-2 border-black px-6 py-3 font-display tracking-wider">
                            {showtime.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cinema illustration */}
                <div className="flex justify-center">
                  <svg viewBox="0 0 300 200" className="w-full max-w-xs opacity-80">
                    <rect x="50" y="80" width="60" height="40" fill="#912D3C" stroke="white" strokeWidth="2"/>
                    <circle cx="120" cy="100" r="15" fill="white" stroke="#912D3C" strokeWidth="2"/>
                    <polygon points="135,85 250,60 250,140 135,115" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1"/>
                    <rect x="240" y="50" width="50" height="90" fill="white" stroke="#912D3C" strokeWidth="2"/>
                    <g fill="none" stroke="#912D3C" strokeWidth="2">
                      <circle cx="80" cy="60" r="8"/>
                      <circle cx="80" cy="140" r="8"/>
                    </g>
                    <g stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                      <line x1="140" y1="90" x2="240" y2="70"/>
                      <line x1="140" y1="100" x2="240" y2="100"/>
                      <line x1="140" y1="110" x2="240" y2="130"/>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Book button */}
              <div className="text-center mt-8">
                <button
                  onClick={onBookClick}
                  className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-[#912D3C] text-white font-display text-lg tracking-wider hover:bg-[#A43D4C] transition-colors border-2 border-black shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all"
                >
                  <Ticket className="w-6 h-6" strokeWidth={2} />
                  REZERVOVAT VSTUPENKY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};