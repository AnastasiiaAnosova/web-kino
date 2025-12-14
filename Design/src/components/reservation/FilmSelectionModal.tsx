import { X, Check } from 'lucide-react';
import { Film } from '../../types';

interface FilmSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  films: Film[];
  selectedFilmId: string | null;
  onFilmSelect: (filmId: string) => void;
}

export const FilmSelectionModal = ({
  isOpen,
  onClose,
  films,
  selectedFilmId,
  onFilmSelect,
}: FilmSelectionModalProps) => {
  if (!isOpen) return null;

  const handleSelect = (filmId: string) => {
    onFilmSelect(filmId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden border-4 border-black shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white p-6">
          <div className="h-2 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent absolute top-0 left-0 right-0" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#912D3C]" />
              <h3 className="text-xl tracking-widest font-display">VYBERTE FILM</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 transition-colors rounded"
              aria-label="Zavřít"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="h-2 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent absolute bottom-0 left-0 right-0" />
        </div>

        {/* Films grid */}
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {films.map((film) => (
              <div
                key={film.id}
                onClick={() => handleSelect(film.id)}
                className={`relative p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
                  selectedFilmId === film.id
                    ? 'border-[#912D3C] bg-[#912D3C]/10 shadow-lg'
                    : 'border-gray-300 hover:border-[#912D3C]/50 hover:bg-gray-50'
                }`}
              >
                {/* Film image */}
                <div className="relative mb-3 overflow-hidden border-2 border-black">
                  <img
                    src={film.image}
                    alt={film.title}
                    className="w-full h-48 object-cover grayscale"
                  />
                  {selectedFilmId === film.id && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-[#912D3C] border-2 border-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Film info */}
                <div>
                  <h4 className="text-sm tracking-wider mb-1 font-display">{film.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{film.subtitle}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{film.year}</span>
                    <span>•</span>
                    <span>{film.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};