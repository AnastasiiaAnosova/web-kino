import { Review } from '../types';
import { API_BASE_URL, API_ENDPOINTS, getApiHeaders, handleApiError, USE_MOCK_DATA } from './config';

// Mock data pro development
const getMockReviews = (filmId: string): Review[] => {
  if (filmId !== '1') return [];
  
  return [
    {
      id: 1,
      author: 'Jan Novák',
      rating: 5,
      date: '2025-11-15',
      text: 'Absolutní klasika! Chaplinův humor je nadčasový a kritika industrializace je stále aktuální.',
      likes: 12,
      dislikes: 1,
      replies: [
        {
          id: 101,
          author: 'Marie Svobodová',
          date: '2025-11-16',
          text: 'Souhlasím! Chaplin je génius.',
          likes: 3,
          dislikes: 0,
          replies: []
        }
      ]
    },
    {
      id: 2,
      author: 'Marie Svobodová',
      rating: 5,
      date: '2025-11-10',
      text: 'Mistrovské dílo němého filmu. Scény z továrny jsou geniální.',
      likes: 8,
      dislikes: 0,
      replies: []
    }
  ];
};

/**
 * Načtení recenzí pro konkrétní film
 */
export const getReviews = async (filmId: string): Promise<Review[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getMockReviews(filmId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REVIEWS(filmId)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.reviews || data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return getMockReviews(filmId);
  }
};

/**
 * Přidání nové recenze
 */
export const addReview = async (filmId: string, rating: number, text: string): Promise<Review> => {
  const currentUser = localStorage.getItem('currentUser');
  const author = currentUser ? JSON.parse(currentUser).firstName + ' ' + JSON.parse(currentUser).lastName : 'Anonym';

  const newReview: Review = {
    id: Date.now(),
    author,
    rating,
    date: new Date().toISOString().split('T')[0],
    text,
    likes: 0,
    dislikes: 0,
    replies: []
  };

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return newReview;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADD_REVIEW(filmId)}`, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify({ rating, text }),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.review || data;
  } catch (error) {
    console.error('Error adding review:', error);
    return newReview;
  }
};

/**
 * Lajknutí recenze
 */
export const likeReview = async (reviewId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LIKE_REVIEW(reviewId)}`, {
      method: 'POST',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      return handleApiError(response);
    }
  } catch (error) {
    console.error('Error liking review:', error);
  }
};

/**
 * Dislajknutí recenze
 */
export const dislikeReview = async (reviewId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DISLIKE_REVIEW(reviewId)}`, {
      method: 'POST',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      return handleApiError(response);
    }
  } catch (error) {
    console.error('Error disliking review:', error);
  }
};

/**
 * Přidání odpovědi na recenzi
 */
export const addReply = async (reviewId: number, text: string, parentReplyId?: number): Promise<void> => {
  const currentUser = localStorage.getItem('currentUser');
  const author = currentUser ? JSON.parse(currentUser).firstName + ' ' + JSON.parse(currentUser).lastName : 'Anonym';

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADD_REPLY(reviewId)}`, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify({ text, author, parentReplyId }),
    });

    if (!response.ok) {
      return handleApiError(response);
    }
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};