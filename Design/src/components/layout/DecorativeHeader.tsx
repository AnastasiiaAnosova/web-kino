import { Link, useNavigate } from 'react-router-dom';
import { Film, ArrowLeft } from 'lucide-react';

interface DecorativeHeaderProps {
  showBackButton?: boolean;
}

export const DecorativeHeader = ({ showBackButton = false }: DecorativeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Top border */}
      <div className="h-3 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent"></div>
      <div className="h-px bg-gradient-to-r from-black via-yellow-600 to-black"></div>
      
      <div className="container">
        <div className="relative z-10 flex items-center justify-between py-8">
          {/* Back button - levá strana */}
          <div className="flex-1">
            {showBackButton && (
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black transition-all duration-300 font-display tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">ZPĚT</span>
              </button>
            )}
          </div>

          {/* Logo - centrované */}
          <Link to="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity no-underline">
            <div className="relative">
              <Film className="w-12 h-12 text-[#912D3C]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-display tracking-widest">GRAPHITE</h1>
              <p className="text-xs font-display tracking-[0.2em] text-gray-300">KINEMATOGRAF</p>
            </div>
          </Link>

          {/* Prázdný prostor vpravo pro vyvážení */}
          <div className="flex-1"></div>
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-black via-yellow-600 to-black"></div>
      <div className="h-2 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute w-12 h-12 border-2 border-yellow-600/30 transform rotate-45 top-4 left-10"></div>
      <div className="absolute w-8 h-8 border-2 border-yellow-600/30 transform -rotate-12 top-8 right-16"></div>
    </header>
  );
};