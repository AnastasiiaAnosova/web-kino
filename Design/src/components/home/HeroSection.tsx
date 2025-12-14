import { Ticket, Calendar } from 'lucide-react';

interface HeroSectionProps {
  onProgramClick?: () => void;
  onReservationClick?: () => void;
}

export const HeroSection = ({ onProgramClick, onReservationClick }: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-b from-[#f9f9f9] to-white py-24 md:py-32 overflow-hidden">
      <div className="container">
        <div className="flex flex-col items-center mb-20">
          {/* Title */}
          <div className="text-center mb-16 w-full">            
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6 drop-shadow-lg">
              ČERNO-BÍLÉ FILMY
            </h2>
            
            <p className="font-display text-xl md:text-2xl text-gray-600 tracking-wider mb-6">
              ZLATÁ ÉRA KINEMATOGRAFIE
            </p>

            <div className="flex flex-wrap items-center gap-4 text-base text-gray-500 mb-10 justify-center">
              <span className="text-[#912D3C] text-xl">★</span>
              <span>OD ROKU 1925</span>
              <span>•</span>
              <span>PARDUBICE</span>
              <span>•</span>
              <span>ORIGINÁLNÍ ZÁŽITEK</span>
            </div>

            {/* Vintage Poster SVG - nyní mezi řádky */}
            <div className="relative w-full max-w-2xl mx-auto mb-10">
              <div className="relative">
                <div className="absolute -inset-2 bg-black transform rotate-2 shadow-2xl" />
                <div className="relative bg-white border-4 border-black shadow-xl p-[8px]">
                  <svg viewBox="0 0 400 600" className="w-full h-auto">
                    <rect width="400" height="600" fill="#f8f8f8" stroke="#000" strokeWidth="4"/>
                    <rect x="20" y="20" width="360" height="560" fill="none" stroke="#000" strokeWidth="2"/>
                    
                    <g fill="#912D3C">
                      <polygon points="50,50 350,50 330,80 70,80"/>
                      <rect x="50" y="85" width="300" height="4"/>
                    </g>
                    
                    <rect x="50" y="100" width="300" height="80" fill="#000"/>
                    <text x="200" y="130" textAnchor="middle" fill="white" fontSize="24" fontFamily="serif" fontWeight="bold" letterSpacing="4px">GRAPHITE</text>
                    <text x="200" y="155" textAnchor="middle" fill="#912D3C" fontSize="12" fontFamily="serif" letterSpacing="2px">KINEMATOGRAF</text>
                    
                    <rect x="70" y="200" width="260" height="280" fill="white" stroke="#000" strokeWidth="2"/>
                    
                    <g transform="translate(70,200)">
                      <path 
                        d="M 40 30 Q 70 50, 100 30" 
                        fill="none" 
                        stroke="#912D3C" 
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path 
                        d="M 160 30 Q 190 50, 220 30" 
                        fill="none" 
                        stroke="#912D3C" 
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      
                      {/* Kruhy po stranách (líčka/tváře) - menší ale tlustší */}
                      <circle cx="40" cy="120" r="6" fill="none" stroke="#912D3C" strokeWidth="3"/>
                      <circle cx="220" cy="120" r="6" fill="none" stroke="#912D3C" strokeWidth="3"/>
                      
                      <rect x="20" y="200" width="220" height="80" fill="#000"/>
                      <rect x="40" y="160" width="180" height="40" fill="white" stroke="#000" strokeWidth="1"/>
                      <polygon points="130,80 60,160 200,160" fill="rgba(255,255,255,0.3)" stroke="#000" strokeWidth="1"/>
                      
                      <g fill="#000">
                        <circle cx="60" cy="220" r="8"/>
                        <rect x="56" y="228" width="8" height="20"/>
                        <circle cx="90" cy="225" r="8"/>
                        <rect x="86" y="233" width="8" height="20"/>
                        <circle cx="120" cy="220" r="8"/>
                        <rect x="116" y="228" width="8" height="20"/>
                        <circle cx="150" cy="225" r="8"/>
                        <rect x="146" y="233" width="8" height="20"/>
                        <circle cx="180" cy="220" r="8"/>
                        <rect x="176" y="228" width="8" height="20"/>
                      </g>
                      
                      <rect x="120" y="40" width="20" height="20" fill="#000"/>
                      <rect x="125" y="35" width="10" height="10" fill="#912D3C"/>
                    </g>
                    
                    <rect x="50" y="500" width="300" height="80" fill="#912D3C"/>
                    <text x="200" y="525" textAnchor="middle" fill="white" fontSize="14" fontFamily="serif" fontWeight="bold" letterSpacing="2px">NĚMÉ FILMY</text>
                    <text x="200" y="545" textAnchor="middle" fill="white" fontSize="10" fontFamily="serif" letterSpacing="1px">ZLATÁ ÉRA KINEMATOGRAFIE</text>
                  </svg>
                </div>
              </div>
            </div>

            <p className="font-serif text-lg text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
              Objevte kouzlo černo-bílého filmu v autentickém prostředí historického kina.
              Ponořte se do atmosféry zlaté éry kinematografie.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onProgramClick}
                className="px-8 py-4 bg-black text-white font-display text-sm tracking-wider hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                AKTUÁLNÍ PROGRAM
              </button>
              <button
                onClick={onReservationClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-black border-2 border-black font-display text-sm tracking-wider hover:bg-black hover:text-white transition-colors shadow-md hover:shadow-lg"
              >
                <Ticket className="w-4 h-4" strokeWidth={2} />
                REZERVACE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-16 h-16 border-2 border-[#912D3C]/30 transform rotate-45" />
      <div className="absolute bottom-20 right-10 w-12 h-12 border-2 border-[#912D3C]/30 transform rotate-12" />
    </section>
  );
};