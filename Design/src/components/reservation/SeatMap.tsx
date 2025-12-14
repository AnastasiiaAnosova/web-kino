import { Seat } from '../../types';
import { Fragment } from 'react';

interface SeatMapProps {
  seats: Seat[];
  onSeatClick: (seatId: string) => void;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 10;
const AISLE_POSITIONS = [3, 7];

export const SeatMap = ({ seats, onSeatClick }: SeatMapProps) => {
  const getSeat = (row: string, number: number): Seat | undefined => {
    return seats.find(s => s.id === `${row}${number}`);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Screen */}
      <div className="bg-gradient-to-b from-gray-200 to-gray-100 border-2 border-gray-400 rounded-t-full p-3 text-center text-xs tracking-[0.2em] text-gray-600 mb-8">
        PLÁTNO
      </div>
      
      {/* Seats */}
      <div className="flex flex-col gap-2 mb-8">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-2 justify-center items-center">
            <div className="w-6 text-center text-sm font-semibold text-gray-600">
              {row}
            </div>
            {[...Array(SEATS_PER_ROW)].map((_, i) => {
              const seatNumber = i + 1;
              const seat = getSeat(row, seatNumber);
              
              // Add aisle space
              const aisleSpace = AISLE_POSITIONS.includes(i) ? (
                <div key={`aisle-${row}-${i}`} className="seat-aisle" />
              ) : null;
              
              if (!seat) return <Fragment key={`empty-${row}-${i}`}>{aisleSpace}</Fragment>;
              
              const seatClasses = [
                'seat',
                seat.status === 'available' && 'seat-available',
                seat.status === 'selected' && 'seat-selected',
                seat.status === 'occupied' && 'seat-occupied',
              ].filter(Boolean).join(' ');
              
              return (
                <Fragment key={`seat-${row}-${i}`}>
                  {aisleSpace}
                  <div
                    className={seatClasses}
                    onClick={() => seat.status !== 'occupied' && onSeatClick(seat.id)}
                  />
                </Fragment>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 p-4 bg-black/5 border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-t border-2 border-gray-600 bg-white" />
          <span>Volné</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-t border-2 border-black bg-[#912D3C] shadow-[0_0_0_2px_#912D3C]" />
          <span>Vaše volba</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-t border-2 border-gray-400 bg-gray-300 opacity-50" />
          <span>Obsazené</span>
        </div>
      </div>

      {/* Decorative film strip elements */}
      <div className="flex justify-center gap-4 mt-8 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-4 h-2 bg-black" />
            <div className="w-4 h-4 border-2 border-black" />
          </div>
        ))}
      </div>
    </div>
  );
};