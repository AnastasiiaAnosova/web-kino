import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { DecorativeHeader } from '../components/layout/DecorativeHeader';
import { Footer } from '../components/layout/Footer';
import { DecorativeCurtain } from '../components/layout/DecorativeCurtain';
import { getFilmById } from '../api/films';
import { Film } from '../types';
import { processPayment } from '../api/reservations';

const STANDARD_PRICE = 180;

export const Payment = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookingData = async () => {
      const dataStr = sessionStorage.getItem('bookingData');
      if (!dataStr) {
        navigate('/reservation');
        return;
      }

      const data = JSON.parse(dataStr);
      setBookingData(data);

      // Load film details
      if (data.selectedFilmId) {
        const filmData = await getFilmById(data.selectedFilmId);
        setFilm(filmData);
      }

      setLoading(false);
    };

    loadBookingData();
  }, [navigate]);

const handlePayment = async () => {
    // 1. Спрашиваем подтверждение (симуляция шлюза)
    const confirmed = confirm('Přejít k platbě? Po potvrzení budete přesměrováni na platební bránu.');
    
    if (confirmed) {
      try {
        setLoading(true); // Включаем спинner

        // 2. !!! ОТПРАВЛЯЕМ ЗАПРОС НА БЭКЕНД !!!
        // bookingData.reservationId мы сохранили в Reservation.tsx
        if (bookingData?.reservationId) {
           await processPayment(bookingData.reservationId);
        } else {
           console.error("Missing reservation ID");
           // Можно продолжить даже если ID нет (для тестов), но лучше показать ошибку
        }

        // 3. Если всё прошло успешно (не вылетела ошибка):
        sessionStorage.setItem('bookingPaid', 'true');
        alert('Platba byla úspěšně zpracována a uložena! Děkujeme.');
        sessionStorage.removeItem('bookingData');
        navigate('/');

      } catch (error) {
        console.error("Payment failed", error);
        alert('Platba se nezdařila. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const generateTicketNumber = () => {
    return Math.floor(Math.random() * 900000 + 100000).toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
    const months = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 
                    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
    
    return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`;
  };

  if (loading || !bookingData || !film) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#912D3C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-wider">Načítání...</p>
        </div>
      </div>
    );
  }

  const showtime = film.showtimes.find(s => s.id === bookingData.selectedShowtimeId);
  const total = bookingData.selectedSeats.length * STANDARD_PRICE;

  return (
    <div className="min-h-screen bg-white font-display">
      <DecorativeHeader showBackButton={true} />

      <main className="relative pt-8">
        <div className="container py-8 print:py-4">
          {/* Ticket - upraveno pro tisk na A4 */}
          <div className="max-w-2xl mx-auto print:max-w-full">
            <div className="relative print:static">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#912D3C] to-black transform rotate-2 print:hidden shadow-2xl" />
              <div className="absolute -inset-2 bg-black print:hidden shadow-xl" />
              
              <div className="relative bg-white border-4 border-black print:border-2 shadow-2xl">
                {/* Decorative corners - pro tisk */}
                <div className="hidden print:block">
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-black" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-black" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-black" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-black" />
                </div>
                
                {/* Ticket header strip */}
                <div className="h-3 bg-gradient-to-r from-black via-[#912D3C] to-black print:h-2" />
                
                {/* Perforations top */}
                <div className="flex justify-between px-4 py-2 bg-gray-50 border-b-2 border-dashed border-gray-300 print:py-1 print:px-2">
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className="block w-2 h-2 bg-gray-400 rounded-full print:w-1 print:h-1" />
                  ))}
                </div>

                <div className="p-8 print:p-4">
                  {/* Ticket header */}
                  <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300 print:mb-3 print:pb-2">
                    <Ticket className="text-[#912D3C] mx-auto mb-2 print:hidden drop-shadow-lg" size={40} />
                    
                    {/* Print-only decorative header */}
                    <div className="hidden print:block mb-3">
                      {/* Top ornamental border */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 border border-black transform rotate-45" />
                          <div className="w-8 h-px bg-black" />
                        </div>
                        <div className="text-center tracking-[0.3em] text-2xl">★</div>
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-px bg-black" />
                          <div className="w-2 h-2 border border-black transform rotate-45" />
                        </div>
                      </div>
                      {/* Vintage pattern */}
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <div className="w-1 h-1 bg-[#912D3C] rounded-full" />
                        <div className="w-1 h-1 bg-black rounded-full" />
                        <div className="w-1 h-1 bg-[#912D3C] rounded-full" />
                        <div className="w-4 h-px bg-gray-300" />
                        <div className="w-2 h-2 border border-[#912D3C] transform rotate-45" />
                        <div className="w-4 h-px bg-gray-300" />
                        <div className="w-1 h-1 bg-[#912D3C] rounded-full" />
                        <div className="w-1 h-1 bg-black rounded-full" />
                        <div className="w-1 h-1 bg-[#912D3C] rounded-full" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg tracking-widest mb-2 print:text-base print:mb-1">GRAPHITE KINEMATOGRAF</h3>
                    <div className="h-px bg-gray-300 w-32 mx-auto mb-2" />
                    <h4 className="tracking-widest text-sm mb-2 print:text-xs">VSTUPENKOVÝ DOKLAD</h4>
                    <p className="text-sm text-gray-600 print:text-xs">
                      Číslo rezervace: <span className="font-bold">#{generateTicketNumber()}</span>
                    </p>
                    
                    {/* Bottom ornament - print only */}
                    <div className="hidden print:flex items-center justify-center gap-2 mt-3">
                      <div className="w-1 h-1 bg-black rounded-full" />
                      <div className="w-3 h-px bg-black" />
                      <div className="w-1 h-1 bg-[#912D3C]" style={{ transform: 'rotate(45deg)' }} />
                      <div className="w-3 h-px bg-black" />
                      <div className="w-1 h-1 bg-black rounded-full" />
                    </div>
                  </div>

                  {/* Customer name */}
                  <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 print:mb-2 print:pb-2">
                    <label className="block text-xs text-gray-500 mb-1 tracking-wider">JMÉNO ZÁKAZNÍKA</label>
                    <p className="text-base tracking-wider font-display print:text-sm">{bookingData.customerData.name}</p>
                  </div>

                  {/* Ticket details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 tracking-wider">FILM</label>
                      <p className="font-display tracking-wider mb-1 text-sm print:text-xs">{film.title}</p>
                      <p className="text-sm text-gray-600 print:text-xs">{film.subtitle}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 tracking-wider">ROK / DÉLKA</label>
                      <p className="text-sm print:text-xs">{film.year}</p>
                      <p className="text-sm print:text-xs">{film.duration}</p>
                    </div>
                    
                    {showtime && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1 tracking-wider">PŘEDSTAVENÍ</label>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-[#912D3C] print:hidden" />
                            <span className="text-sm print:text-xs">{formatDate(showtime.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#912D3C] print:hidden" />
                            <span className="text-sm print:text-xs">{showtime.time}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1 tracking-wider">MÍSTO</label>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#912D3C] print:hidden" />
                            <span className="text-sm print:text-xs">Filmová 123, Pardubice 1</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4 mb-4 print:pt-2 print:mb-2">
                    <label className="block text-xs text-gray-500 mb-2 tracking-wider">SEDADLA</label>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.selectedSeats.map((seat: string) => (
                        <span
                          key={seat}
                          className="px-3 py-1 bg-[#912D3C] text-white text-sm tracking-wider border-2 border-black print:text-xs print:px-2 print:py-0.5 print:border shadow-md"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-3 mb-3 print:pt-2 print:mb-2">
                    <label className="block text-xs text-gray-500 mb-1 tracking-wider">KONTAKT</label>
                    <p className="text-sm print:text-xs">{bookingData.customerData.email}</p>
                    <p className="text-sm print:text-xs">{bookingData.customerData.phone}</p>
                  </div>

                  {/* Total */}
                  <div className="bg-[#912D3C] text-white p-4 -mx-8 -mb-8 flex justify-between items-center print:p-2 print:-mx-4 print:-mb-4 shadow-inner">
                    <span className="text-sm tracking-widest print:text-xs">CELKOVÁ ČÁSTKA:</span>
                    <span className="text-2xl tracking-widest print:text-lg">{total} Kč</span>
                  </div>
                </div>
                
                {/* Perforations bottom */}
                <div className="hidden print:flex justify-between px-2 py-1 bg-gray-50 border-t-2 border-dashed border-gray-300">
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className="block w-1 h-1 bg-gray-400 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="max-w-2xl mx-auto my-8 print:hidden">
            <div className="bg-black text-white p-4 border-4 border-[#912D3C] text-center shadow-lg">
              <Ticket className="text-[#912D3C] mx-auto mb-3 drop-shadow-lg" size={24} />
              <p className="text-sm leading-relaxed">
                Vstupenky si můžete vyzvednout na pokladně{' '}
                <strong className="text-[#912D3C]">nejpozději 15 minut před začátkem</strong> představení.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 mb-12 print:hidden">
            <button
              onClick={handlePayment}
              className="flex-1 px-6 py-4 bg-[#912D3C] text-white border-2 border-black font-display tracking-wider hover:bg-[#A43D4C] transition-colors shadow-lg hover:shadow-xl"
            >
              PŘEJÍT K PLATBĚ
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-4 bg-transparent text-black border-2 border-black font-display tracking-wider hover:bg-gray-100 transition-colors"
            >
              VYTISKNOUT
            </button>
          </div>
        </div>
      </main>

      <Footer />
      
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          header, footer {
            display: none !important;
          }
          
          .print\\:static {
            position: static !important;
          }
          
          .print\\:border-2 {
            border-width: 2px !important;
          }
          
          .print\\:h-2 {
            height: 0.5rem !important;
          }
          
          .print\\:py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .print\\:w-1 {
            width: 0.25rem !important;
          }
          
          .print\\:h-1 {
            height: 0.25rem !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:mb-3 {
            margin-bottom: 0.75rem !important;
          }
          
          .print\\:pb-2 {
            padding-bottom: 0.5rem !important;
          }
          
          .print\\:text-base {
            font-size: 1rem !important;
          }
          
          .print\\:mb-1 {
            margin-bottom: 0.25rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          
          .print\\:gap-2 {
            gap: 0.5rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:w-3 {
            width: 0.75rem !important;
          }
          
          .print\\:h-3 {
            height: 0.75rem !important;
          }
          
          .print\\:pt-2 {
            padding-top: 0.5rem !important;
          }
          
          .print\\:px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .print\\:py-0\\.5 {
            padding-top: 0.125rem !important;
            padding-bottom: 0.125rem !important;
          }
          
          .print\\:border {
            border-width: 1px !important;
          }
          
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          
          .print\\:-mx-4 {
            margin-left: -1rem !important;
            margin-right: -1rem !important;
          }
          
          .print\\:-mb-4 {
            margin-bottom: -1rem !important;
          }
          
          .print\\:text-lg {
            font-size: 1.125rem !important;
          }
          
          .print\\:my-3 {
            margin-top: 0.75rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .print\\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};