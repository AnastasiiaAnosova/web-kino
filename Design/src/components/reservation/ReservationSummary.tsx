import { Film, Showtime } from '../../types';
import { Ticket } from 'lucide-react';

interface ReservationSummaryProps {
  selectedFilm: Film | null;
  selectedShowtime: Showtime | null;
  selectedSeats: string[];
  totalPrice: number;
}

const STANDARD_PRICE = 180;

export const ReservationSummary = ({
  selectedFilm,
  selectedShowtime,
  selectedSeats,
  totalPrice,
}: ReservationSummaryProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
    const months = ['led', 'úno', 'bře', 'dub', 'kvě', 'čer', 'čec', 'srp', 'zář', 'říj', 'lis', 'pro'];
    
    return `${date.getDate()}. ${months[date.getMonth()]}`;
  };

  return (
    <div className="relative">
      <div className="absolute -inset-2 bg-black transform rotate-2 z-0 shadow-xl" />
      
      <div className="relative z-10 bg-white border-4 border-black shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-[#912D3C] via-black to-[#912D3C]" />
        
        <div className="flex justify-between px-4 py-2 bg-gray-50">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="block w-1.5 h-1.5 bg-gray-400 rounded-full" />
          ))}
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <Ticket className="text-[#912D3C] mx-auto mb-2" size={40} />
            <h4 className="text-sm tracking-widest font-display">VAŠE REZERVACE</h4>
          </div>

          <div className="flex flex-col gap-4">
            {selectedFilm ? (
              <div className="pb-4 border-b border-dashed border-gray-300">
                <label className="block text-xs text-gray-500 mb-1 tracking-wider">FILM</label>
                <p className="text-sm tracking-widest mb-1 font-display">{selectedFilm.title}</p>
                <p className="text-xs text-gray-600">{selectedFilm.subtitle}</p>
              </div>
            ) : null}
            
            {selectedShowtime ? (
              <div className="pb-4 border-b border-dashed border-gray-300">
                <label className="block text-xs text-gray-500 mb-1 tracking-wider">PROMITNUTÍ</label>
                <p className="text-xs mb-1">{formatDate(selectedShowtime.date)}</p>
                <p className="tracking-widest">{selectedShowtime.time}</p>
              </div>
            ) : null}
            
            {selectedSeats.length > 0 ? (
              <>
                <div className="pb-4 border-b border-dashed border-gray-300">
                  <label className="block text-xs text-gray-500 mb-1 tracking-wider">
                    SEDADLA ({selectedSeats.length})
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(seat => (
                      <span key={seat} className="px-2 py-1 bg-[#912D3C] text-white text-xs tracking-wider border-2 border-black">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span>Standardní ({selectedSeats.length}x)</span>
                    <span>{selectedSeats.length * STANDARD_PRICE} Kč</span>
                  </div>
                </div>
              </>
            ) : null}
          
            <div className="flex justify-between items-center bg-black text-white p-4 -mx-6 -mb-6">
              <span className="text-sm tracking-widest font-display">CELKEM</span>
              <span className="text-xl tracking-widest font-display">{totalPrice} Kč</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};