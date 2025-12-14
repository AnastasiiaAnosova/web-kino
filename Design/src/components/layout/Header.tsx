import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Menu, Ticket, User } from 'lucide-react';
import { getCurrentUser } from '../../api/auth';

interface HeaderProps {
  onAuthClick?: () => void;
  onTicketsClick?: () => void;
}

export const Header = ({ onAuthClick, onTicketsClick }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const handleAuthClick = () => {
    if (onAuthClick) {
      onAuthClick();
    }
  };

  const handleTicketsClick = () => {
    if (onTicketsClick) {
      onTicketsClick();
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Top border */}
      <div className="h-3 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent"></div>
      <div className="h-px bg-gradient-to-r from-black via-yellow-600 to-black"></div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between p-[0px] px-[0px] py-[32px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity no-underline">
            <div className="relative">
              <Film className="w-12 h-12 text-[#912D3C]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-display tracking-widest">GRAPHITE</h1>
              <p className="text-xs font-display tracking-[0.2em] text-gray-300">KINEMATOGRAF</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#program" className="font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider no-underline">
              PROGRAM
            </a>
            <a href="#o-nas" className="font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider no-underline">
              O NÁS
            </a>
            <a href="#kontakt" className="font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider no-underline">
              KONTAKTY
            </a>
            <div className="w-px h-8 bg-gray-600"></div>
            
            {/* Account button */}
            <button
              onClick={handleAuthClick}
              className="p-2 hover:bg-gray-800 hover:text-[#912D3C] rounded transition-colors"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <User className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
            
            {/* Tickets button */}
            <button
              onClick={handleTicketsClick}
              className="flex items-center gap-2 px-6 py-3 bg-[#912D3C] text-white font-display text-sm tracking-wider hover:bg-[#A43D4C] transition-colors"
            >
              <Ticket className="w-4 h-4" strokeWidth={2} />
              VSTUPENKY
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            <Menu className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-6 pt-2 border-t border-gray-700">
            <a href="#program" className="block font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider mb-4 no-underline">
              PROGRAM
            </a>
            <a href="#o-nas" className="block font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider mb-4 no-underline">
              O NÁS
            </a>
            <a href="#kontakt" className="block font-display text-sm text-white hover:text-[#912D3C] transition-colors tracking-wider mb-4 no-underline">
              KONTAKT
            </a>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAuthClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-800 hover:text-[#912D3C] rounded transition-colors font-display text-sm tracking-wider"
              >
                <User className="w-4 h-4" strokeWidth={2} />
                ÚČET
              </button>
              <button
                onClick={handleTicketsClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#912D3C] text-white font-display text-sm tracking-wider hover:bg-[#A43D4C] transition-colors"
              >
                <Ticket className="w-4 h-4" strokeWidth={2} />
                VSTUPENKY
              </button>
            </div>
          </nav>
        )}
      </div>
      
      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-black via-yellow-600 to-black"></div>
      <div className="h-2 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent px-[0px] py-[10px]"></div>
      
      {/* Decorative elements */}
      <div className="absolute w-12 h-12 border-2 border-yellow-600/30 transform rotate-45 top-4 left-10"></div>
      <div className="absolute w-8 h-8 border-2 border-yellow-600/30 transform -rotate-12 top-8 right-16"></div>
    </header>
  );
};