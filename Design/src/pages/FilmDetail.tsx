import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Star } from 'lucide-react';
import { DecorativeHeader } from '../components/layout/DecorativeHeader';
import { getFilmById } from '../api/films';
// <--- !!! 1. ДОБАВИЛ ИМПОРТ likeReview и dislikeReview
import { getReviews, addReview, addReply, likeReview, dislikeReview } from '../api/reviews';
import { Film, Review, Reply } from '../types';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { ReviewItem } from '../components/reviews/ReviewItem';
import { DecorativeCurtain } from '../components/layout/DecorativeCurtain';

export const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [film, setFilm] = useState<Film | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const loadFilm = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const filmData = await getFilmById(id);
        setFilm(filmData);
      } catch (error) {
        console.error('Error loading film:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilm();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      
      setReviewsLoading(true);
      try {
        const reviewsData = await getReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  const handleReviewSubmit = async (rating: number, text: string) => {
    if (!id) return;

    try {
      const newReview = await addReview(id, rating, text);
      setReviews([newReview, ...reviews]);
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Chyba při odesílání recenze');
    }
  };

  // <--- !!! 2. ДОБАВИЛ ФУНКЦИИ ЛАЙКОВ И ДИЗЛАЙКОВ (ВСТАВИТЬ СЮДА)
  const handleLike = async (reviewId: number) => {
    if (!id) return;
    try {
      await likeReview(reviewId);
      // После лайка обновляем список отзывов, чтобы увидеть новые цифры
      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislike = async (reviewId: number) => {
    if (!id) return;
    try {
      await dislikeReview(reviewId);
      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };
  // <--- КОНЕЦ ВСТАВКИ

  const handleReplyToReview = async (reviewId: number, text: string, author: string) => {
    if (!id) return;
    try {
      await addReply(id, reviewId, text);
      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Chyba při přidávání odpovědi');
    }
  };

  const handleReplyToNestedReply = async (reviewId: number, parentReplyId: number, text: string, author: string) => {
    if (!id) return;
    try {
      await addReply(id, parentReplyId, text);
      
      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error adding nested reply:', error);
      alert('Chyba při přidávání odpovědi');
    }
  };

  const handleBookTickets = () => {
    if (film) {
      sessionStorage.setItem('preselectedFilm', film.id);
      navigate('/reservation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#912D3C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display tracking-wider text-white">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-display tracking-wider mb-4">Film nebyl nalezen</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#912D3C] text-white font-display tracking-wider hover:bg-[#A43D4C] transition-colors"
          >
            Zpět na hlavní stránku
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-display">
      <DecorativeHeader showBackButton={true} />

      {/* Hero Header */}
      <div className="relative h-[500px] overflow-hidden">
        {/* Backdrop image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${film.image})`,
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10 bg-repeat"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(114, 47, 55, 0.3) 50px, rgba(114, 47, 55, 0.3) 52px)'
          }}
        />
        
        {/* Curtain effect */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#912D3C] to-transparent opacity-60" />
        
        {/* Content */}
        <div className="relative z-10 container h-full flex items-end pb-12">
          <div className="flex gap-8 items-end w-full">
            {/* Poster */}
            <div className="relative hidden md:block">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#912D3C] to-black transform rotate-2" />
              <div className="relative bg-white border-4 border-black p-2">
                <img 
                  src={film.image}
                  alt={film.title}
                  className="w-64 h-96 object-cover"
                />
              </div>
            </div>

            {/* Title info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-12 bg-[#912D3C]" />
                <span className="text-sm tracking-widest font-display">{film.year}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl tracking-wider mb-2 font-display">{film.title}</h1>
              <p className="text-xl text-gray-300 mb-4 font-serif italic">{film.subtitle}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                {film.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(film.rating!) ? 'fill-[#912D3C] text-[#912D3C]' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">{film.rating}</span>
                    {film.reviewCount && (
                      <span className="text-sm text-gray-300">({film.reviewCount} recenzí)</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{film.duration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{film.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-[#912D3C]/50 transform rotate-45" />
      </div>

      {/* Main content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-[#912D3C]" />
                <h2 className="text-2xl tracking-wider font-display">DĚJ FILMU</h2>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#912D3C]/5 to-transparent" />
                <div className="relative space-y-4 text-gray-700 leading-relaxed">
                  <p className="font-serif text-lg italic">{film.description}</p>
                </div>
              </div>
            </section>

            {/* Awards */}
            {film.awards && film.awards.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-[#912D3C]" />
                  <h2 className="text-2xl tracking-wider font-display">OCENĚNÍ</h2>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-black transform rotate-1" />
                  <div className="relative bg-gradient-to-br from-gray-50 to-white border-4 border-black p-6">
                    <ul className="space-y-3">
                      {film.awards.map((award, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Star className="text-[#912D3C] fill-[#912D3C] flex-shrink-0 mt-1 w-4 h-4" />
                          <span className="text-gray-700">{award}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews section */}
            <section id="reviews">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-[#912D3C]" />
                <h2 className="text-2xl tracking-wider font-display">RECENZE DIVÁKŮ</h2>
                <span className="text-gray-500">({reviews.length})</span>
              </div>

              {/* Write review form */}
              <ReviewForm onSubmit={handleReviewSubmit} />

              {/* Reviews list */}
              <div className="space-y-6 mt-8">
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[#912D3C] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Zatím žádné recenze. Buďte první, kdo napíše recenzi!</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <ReviewItem 
                      key={review.id} 
                      review={review} 
                      // <--- !!! 3. ЗДЕСЬ Я ПЕРЕДАЛ НОВЫЕ ПРОПСЫ (onLike, onDislike)
                      onLike={() => handleLike(review.id)}
                      onDislike={() => handleDislike(review.id)}
                      onReply={handleReplyToReview} 
                      onReplyToReply={handleReplyToNestedReply} 
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Info card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-black transform -rotate-1" />
                <div className="relative bg-white border-4 border-black p-6">
                  <h3 className="text-lg tracking-wider mb-4 text-center font-display">INFORMACE</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Rok výroby:</span>
                      <span className="font-medium">{film.year}</span>
                    </div>
                    {film.country && (
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-600">Země:</span>
                        <span className="font-medium">{film.country}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Délka:</span>
                      <span className="font-medium">{film.duration}</span>
                    </div>
                    {film.language && (
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-600">Jazyk:</span>
                        <span className="font-medium">{film.language}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Book tickets */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#912D3C] to-black transform rotate-2" />
                <div className="relative bg-white border-4 border-black p-6 text-center">
                  <Calendar className="mx-auto mb-4 text-[#912D3C] w-12 h-12" />
                  <h3 className="text-lg tracking-wider mb-2 font-display">AKTUÁLNĚ V PROGRAMU</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tento film můžete shlédnout v našem kině
                  </p>
                  <button 
                    onClick={handleBookTickets}
                    className="block w-full py-4 bg-[#912D3C] text-white tracking-wider hover:bg-[#A43D4C] transition-colors border-2 border-black font-display"
                  >
                    REZERVOVAT VSTUPENKY
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom curtain */}
      <DecorativeCurtain position="bottom" />
    </div>
  );
};