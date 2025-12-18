import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedFilm } from '../components/home/FeaturedFilm';
import { FilmGrid } from '../components/films/FilmGrid';
import { AboutSection } from '../components/home/AboutSection';
import { AuthModal } from '../components/auth/AuthModal';
import { ProfileModal } from '../components/auth/ProfileModal';
import { useFilms } from '../hooks/useFilms';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const navigate = useNavigate();
  const { films, loading } = useFilms();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Featured film (druhý film v databázi protože má časy a to je pěknější)
  const featuredFilm = films[1];

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowProfileModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleTicketsClick = () => {
    navigate('/reservation');
  };

  const handleProgramClick = () => {
    const programSection = document.getElementById('program');
    programSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReservationClick = () => {
    navigate('/reservation');
  };

  const handleFilmBookClick = (filmId: string) => {
    sessionStorage.setItem('preselectedFilm', filmId);
    navigate('/reservation');
  };

  const handleFeaturedBookClick = () => {
    if (featuredFilm) {
      sessionStorage.setItem('preselectedFilm', featuredFilm.id);
      navigate('/reservation');
    }
  };

  const handleSwitchToRegister = () => {
    setShowAuthModal(false);
    navigate('/register');
  };

  const handleEditProfile = () => {
    setShowProfileModal(false);
    navigate('/register?edit=true');
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
    <div className="min-h-screen bg-white">
      <Header 
        onAuthClick={handleAuthClick}
        onTicketsClick={handleTicketsClick}
      />

      <HeroSection 
        onProgramClick={handleProgramClick}
        onReservationClick={handleReservationClick}
      />

      {featuredFilm && (
        <FeaturedFilm 
          film={featuredFilm}
          onBookClick={handleFeaturedBookClick}
        />
      )}

      <FilmGrid 
        films={films}
        onBookClick={handleFilmBookClick}
      />

      <AboutSection />

      <Footer />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onEditProfile={handleEditProfile}
      />
    </div>
  );
};