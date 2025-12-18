import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Film as FilmIcon } from 'lucide-react';
import { DecorativeHeader } from '../components/layout/DecorativeHeader';
import { DecorativeCurtain } from '../components/layout/DecorativeCurtain';
import { SeatMap } from '../components/reservation/SeatMap';
import { ReservationSummary } from '../components/reservation/ReservationSummary';
import { FilmSelectionModal } from '../components/reservation/FilmSelectionModal';
import { getFilms, getFilmShowtimes } from '../api/films';
import { getOccupiedSeats, createReservation } from '../api/reservations';
import { Film, Showtime, Seat, BookingState } from '../types';
import { useAuth } from '../hooks/useAuth';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 10;
const STANDARD_PRICE = 180;

export const Reservation = () => {
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [films, setFilms] = useState<Film[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedFilmId: null,
    selectedShowtimeId: null,
    selectedSeats: [],
    customerData: { name: '', email: '', phone: '' },
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // const selectedFilm = films.find(f => f.id === bookingState.selectedFilmId) || null;
  // const selectedShowtime = showtimes.find(s => s.id === bookingState.selectedShowtimeId) || null;
  // const totalPrice = bookingState.selectedSeats.length * STANDARD_PRICE;
  const selectedFilm = films.find(f => f.id === bookingState.selectedFilmId) || null;
  const selectedShowtime = showtimes.find(s => s.id === bookingState.selectedShowtimeId) || null;

  const unitPrice = selectedShowtime?.price ?? STANDARD_PRICE;
  const totalPrice = bookingState.selectedSeats.length * unitPrice;

  useEffect(() => {
    const loadFilms = async () => {
      setLoading(true);
      try {
        const data = await getFilms();
        setFilms(data);
        
        // Check for preselected film
        const preselectedFilmId = sessionStorage.getItem('preselectedFilm');
        if (preselectedFilmId) {
          setBookingState(prev => ({ ...prev, selectedFilmId: preselectedFilmId }));
          sessionStorage.removeItem('preselectedFilm');
        }
      } catch (error) {
        console.error('Error loading films:', error);
      } finally {
        setLoading(false);
      }

      if(user){
        setCustomerForm({
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          phone: user.phone,
        });
      }

    };

    loadFilms();
  }, []);

  useEffect(() => {
    if (bookingState.selectedShowtimeId) {
      initializeSeats();
    }
  }, [bookingState.selectedShowtimeId]);

  useEffect(() => {
  const loadShowtimes = async () => {
    if (!bookingState.selectedFilmId) {
      setShowtimes([]);
      return;
    }
    try {
      const data = await getFilmShowtimes(bookingState.selectedFilmId);
      setShowtimes(data);
    } catch (e) {
      console.error('Error loading showtimes:', e);
      setShowtimes([]);
    }
  };

  loadShowtimes();
}, [bookingState.selectedFilmId]);

  const initializeSeats = async () => {
    const allSeats: Seat[] = [];
    
    for (const row of ROWS) {
      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        allSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          status: 'available',
        });
      }
    }

    // Get occupied seats from API
    if (bookingState.selectedShowtimeId) {
      try {
        const occupiedSeats = await getOccupiedSeats(bookingState.selectedShowtimeId);
        occupiedSeats.forEach(seatId => {
          const seat = allSeats.find(s => s.id === seatId);
          if (seat) seat.status = 'occupied';
        });
      } catch (error) {
        console.error('Error loading occupied seats:', error);
      }
    }

    setSeats(allSeats);
  };

  const handleFilmSelect = (filmId: string) => {
    setBookingState({
      selectedFilmId: filmId,
      selectedShowtimeId: null,
      selectedSeats: [],
      customerData: { name: '', email: '', phone: '' },
    });
  };

  const handleShowtimeSelect = (showtimeId: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedShowtimeId: showtimeId,
      selectedSeats: [],
    }));
  };

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    setSeats(prev => prev.map(s => {
      if (s.id === seatId) {
        return {
          ...s,
          status: s.status === 'selected' ? 'available' : 'selected',
        };
      }
      return s;
    }));

    setBookingState(prev => {
      const isSelected = prev.selectedSeats.includes(seatId);
      return {
        ...prev,
        selectedSeats: isSelected
          ? prev.selectedSeats.filter(id => id !== seatId)
          : [...prev.selectedSeats, seatId],
      };
    });
  };

  const handleContinue = () => {
    if (!bookingState.selectedFilmId || !bookingState.selectedShowtimeId || bookingState.selectedSeats.length === 0) {
      alert('Prosím vyberte film, představení a sedadla');
      return;
    }
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingState.selectedFilmId || !bookingState.selectedShowtimeId) return;

    try {
      const reservation = await createReservation({
        filmId: bookingState.selectedFilmId,
        showtimeId: bookingState.selectedShowtimeId,
        seats: bookingState.selectedSeats,
        customerData: customerForm,
      });

      sessionStorage.setItem('bookingData', JSON.stringify({
        ...bookingState,
        customerData: customerForm,
        reservationId: reservation.id,
      }));

      navigate('/payment');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Chyba při vytváření rezervace. Zkuste to prosím znovu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#912D3C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-wider">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-display">
      <DecorativeHeader showBackButton={true} />

      <DecorativeCurtain position="top" />

      <main className="relative">
        <div className="container">
          {/* Title section */}
          <div className="relative text-center py-16 mb-16">
            <div className="absolute top-0 left-0 right-0 h-48 opacity-5 bg-cover bg-center overflow-hidden" />
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#912D3C]/10" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#912D3C]/5" />
            
            <div className="relative z-10">
              <h2 className="text-4xl tracking-widest mb-4">REZERVACE VSTUPENEK</h2>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#912D3C]" />
                <FilmIcon className="w-6 h-6 text-[#912D3C]" fill="currentColor" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#912D3C]" />
              </div>
              
              <p className="max-w-2xl mx-auto text-gray-700">
                Vyberte si film, promitnutí a nejlepší místa v historickém sále
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 z-0" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-[#912D3C] z-0 transition-all duration-500"
              style={{ width: step === 'details' ? '100%' : '0%' }}
            />
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-4 ${step === 'details' ? 'border-[#912D3C] bg-[#912D3C]' : 'border-[#912D3C] bg-[#912D3C]'} text-white flex items-center justify-center transition-all shadow-lg`}>
                  {step === 'details' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="tracking-wider">1</span>
                  )}
                </div>
                <span className="mt-3 text-sm tracking-wider text-[#912D3C]">VÝBĚR</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-4 ${step === 'details' ? 'border-[#912D3C] bg-[#912D3C] text-white' : 'border-gray-300 bg-white'} flex items-center justify-center transition-all ${step === 'details' ? 'shadow-lg' : ''}`}>
                  <span className="tracking-wider">2</span>
                </div>
                <span className={`mt-3 text-sm tracking-wider ${step === 'details' ? 'text-[#912D3C]' : 'text-gray-500'}`}>SEDADLA</span>
              </div>
            </div>
          </div>

          {step === 'selection' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Film selection */}
                <FilmSelectionCard 
                  films={films}
                  selectedFilmId={bookingState.selectedFilmId}
                  onFilmSelect={handleFilmSelect}
                />

                {/* Showtime selection */}
                {bookingState.selectedFilmId && (
                  <ShowtimeSelectionCard 
                    showtimes={showtimes}
                    selectedShowtimeId={bookingState.selectedShowtimeId}
                    onShowtimeSelect={handleShowtimeSelect}
                  />
                )}

                {/* Seat selection */}
                {bookingState.selectedShowtimeId && (
                  <SeatSelectionCard 
                    seats={seats}
                    onSeatClick={handleSeatClick}
                  />
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <ReservationSummary 
                    selectedFilm={selectedFilm}
                    selectedShowtime={selectedShowtime}
                    selectedSeats={bookingState.selectedSeats}
                    totalPrice={totalPrice}
                  />

                  <button
                    onClick={handleContinue}
                    disabled={!bookingState.selectedFilmId || !bookingState.selectedShowtimeId || bookingState.selectedSeats.length === 0}
                    className="w-full mt-6 px-8 py-6 bg-[#912D3C] text-white border-4 border-black text-sm tracking-widest hover:bg-[#A43D4C] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-display"
                  >
                    POKRAČOVAT K ÚDAJŮM
                    <span className="text-base">→</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <CustomerDetailsForm 
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              selectedFilm={selectedFilm}
              selectedShowtime={selectedShowtime}
              selectedSeats={bookingState.selectedSeats}
              totalPrice={totalPrice}
              unitPrice={unitPrice}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <DecorativeCurtain position="bottom" />
      </main>
    </div>
  );
};

// Film Selection Component
const FilmSelectionCard = ({ films, selectedFilmId, onFilmSelect }: any) => {
  const [showModal, setShowModal] = useState(false);
  
  // Show first 4 films, ensuring selected film is visible
  let displayedFilms = films.slice(0, 4);
  
  if (selectedFilmId && !displayedFilms.find((f: Film) => f.id === selectedFilmId)) {
    // Selected film is not in first 4, replace the 4th one with selected film
    const selectedFilm = films.find((f: Film) => f.id === selectedFilmId);
    if (selectedFilm) {
      displayedFilms = [...films.slice(0, 3), selectedFilm];
    }
  }

  return (
    <>
      <div className="relative">
        <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-[#912D3C]/40 rounded-full z-10" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-[#912D3C]/40 rounded-full z-10" />
        
        <div className="absolute -inset-1 bg-gradient-to-r from-[#912D3C] to-[#912D3C]/50 transform rotate-1 z-0" />
        
        <div className="relative z-10 bg-white border-4 border-black p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#912D3C]" />
              <h3 className="text-lg tracking-widest">VYBERTE FILM</h3>
            </div>
            {films.length > 4 && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-xs border-2 border-[#912D3C] text-[#912D3C] hover:bg-[#912D3C] hover:text-white transition-colors tracking-wider"
              >
                VŠECHNY FILMY
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedFilms.map((film: Film) => (
              <div
                key={film.id}
                onClick={() => onFilmSelect(film.id)}
                className={`relative p-4 border-2 cursor-pointer transition-all ${
                  selectedFilmId === film.id
                    ? 'border-[#912D3C] bg-[#912D3C]/5 shadow-lg'
                    : 'border-gray-300 hover:border-[#912D3C]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm tracking-wider mb-1 font-display">{film.title}</h4>
                    <p className="text-xs text-gray-600">{film.subtitle}</p>
                  </div>
                  {selectedFilmId === film.id && (
                    <Check className="w-5 h-5 text-[#912D3C]" strokeWidth={3} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{film.year}</span>
                  <span>•</span>
                  <span>{film.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FilmSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        films={films}
        selectedFilmId={selectedFilmId}
        onFilmSelect={onFilmSelect}
      />
    </>
  );
};

// Showtime Selection Component
const ShowtimeSelectionCard = ({ showtimes, selectedShowtimeId, onShowtimeSelect }: any) => (
  <div className="relative">
    <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-[#912D3C]/40 transform rotate-45 z-10" />
    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-[#912D3C]/40 transform rotate-45 z-10" />

    <div className="absolute -inset-1 bg-gradient-to-r from-[#912D3C]/50 to-[#912D3C] transform -rotate-1 z-0" />

    <div className="relative z-10 bg-white border-4 border-black p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[#912D3C]" />
          <h3 className="text-lg tracking-widest">TERMÍN PROMÍTNUTÍ</h3>
        </div>
      </div>

      {(!showtimes || showtimes.length === 0) ? (
        <div className="p-6 text-center">
          <p className="font-serif text-gray-600 italic">Brzy v programu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {showtimes.map((showtime: Showtime) => (
            <div
              key={showtime.id}
              onClick={() => onShowtimeSelect(showtime.id)}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedShowtimeId === showtime.id
                  ? 'border-[#912D3C] bg-[#912D3C]/5 shadow-lg'
                  : 'border-gray-300 hover:border-[#912D3C]/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {new Date(showtime.date).toLocaleDateString('cs-CZ')}
                  </p>
                  <p className="text-lg tracking-wider font-display">{showtime.time}</p>
                </div>

                {selectedShowtimeId === showtime.id && (
                  <Check className="w-5 h-5 text-[#912D3C]" strokeWidth={3} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);


// Seat Selection Component
const SeatSelectionCard = ({ seats, onSeatClick }: any) => (
  <div className="relative">
    <div className="absolute -inset-1 bg-gradient-to-r from-[#912D3C] to-black z-0" />
    
    <div className="relative z-10 bg-gradient-to-b from-gray-50 to-white border-4 border-black p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-[#912D3C]" />
          <FilmIcon className="text-[#912D3C]" size={24} />
          <div className="h-px w-12 bg-[#912D3C]" />
        </div>
        <h3 className="text-lg tracking-widest mb-2">VYBERTE SEDADLA</h3>
        <p className="text-sm text-gray-600">Klikněte na sedadlo pro výběr místa</p>
      </div>
      
      <SeatMap seats={seats} onSeatClick={onSeatClick} />
    </div>
  </div>
);

// Customer Details Form Component
const CustomerDetailsForm = ({ 
  customerForm, 
  setCustomerForm, 
  selectedFilm,
  selectedShowtime,
  selectedSeats,
  totalPrice,
  unitPrice,
  onBack, 
  onSubmit 
}: any) => (
  <div className="max-w-3xl mx-auto">
    <div className="relative">
      <div className="absolute -inset-2 bg-gradient-to-br from-[#912D3C] to-black transform -rotate-1 z-0" />
      
      <div className="relative z-10 bg-white border-4 border-black p-12">
        <div className="text-center mb-8">
          <h3 className="text-xl tracking-widest mb-4">KONTAKTNÍ ÚDAJE</h3>
          <div className="w-24 h-1 bg-[#912D3C] mx-auto" />
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label className="block text-sm tracking-wider mb-2 font-display">JMÉNO A PŘÍJMENÍ *</label>
            <input
              type="text"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              required
              placeholder="Jan Novák"
              className="w-full p-3 border-2 border-gray-300 font-display text-base focus:outline-none focus:border-[#912D3C] transition-colors"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm tracking-wider mb-2 font-display">E-MAIL *</label>
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              required
              placeholder="jan.novak@email.cz"
              className="w-full p-3 border-2 border-gray-300 font-display text-base focus:outline-none focus:border-[#912D3C] transition-colors"
            />
            <small className="block mt-2 text-xs text-gray-500">Potvrzení o rezervaci bude odesláno na tento e-mail</small>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm tracking-wider mb-2 font-display">TELEFON *</label>
            <input
              type="tel"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              required
              placeholder="+420 123 456 789"
              className="w-full p-3 border-2 border-gray-300 font-display text-base focus:outline-none focus:border-[#912D3C] transition-colors"
            />
          </div>
          
          <div className="h-px bg-gray-300 my-8" />
          
          {/* Summary */}
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-[#912D3C]/20 z-0" />
            <div className="relative z-10 bg-gradient-to-br from-gray-50 to-white p-6 border-2 border-[#912D3C]">
              <h4 className="text-center tracking-widest mb-4 font-display">SOUHRN REZERVACE</h4>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Film:</span>
                  <span className="tracking-wider">{selectedFilm?.title}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Promitnutí:</span>
                  <span className="tracking-wider">{selectedShowtime?.date} {selectedShowtime?.time}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Sedadla:</span>
                  <span className="tracking-wider">{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center bg-[#912D3C] text-white p-3 -mx-6 -mb-6">
                  <span className="text-sm tracking-widest">CELKEM:</span>
                  <span className="text-xl tracking-widest">{totalPrice} Kč</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-6 bg-transparent text-black border-2 border-black font-display text-sm tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-base">←</span>
              ZPĚT
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-6 bg-[#912D3C] text-white border-2 border-black font-display text-sm tracking-widest hover:bg-[#A43D4C] transition-all flex items-center justify-center gap-2"
            >
              POTVRDIT
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Kliknutím na tlačítko souhlasíte se zpracováním osobních údajů a obchodními podmínkami.
          </p>
        </form>
      </div>
    </div>
  </div>
);