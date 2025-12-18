// src/api/reviews.ts
import { Review } from '../types';
import { API_ENDPOINTS, handleApiError, USE_MOCK_DATA, API_BASE_URL } from './config';
import { getCsrf } from './auth';

export const getReviews = async (filmId: string): Promise<Review[]> => {
  if (USE_MOCK_DATA) return [];

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REVIEWS(filmId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) return handleApiError(response);
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReview = async (filmId: string, rating: number, text: string): Promise<Review> => {
  const csrf = await getCsrf();

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADD_REVIEW}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf
      },
      credentials: 'include',
      body: JSON.stringify({ filmId, rating, text }),
    });

    if (!response.ok) return handleApiError(response);
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const addReply = async (filmId: string, reviewId: number, text: string): Promise<void> => {
  if (USE_MOCK_DATA) return;
  const csrf = await getCsrf();

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADD_REVIEW}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf
      },
      credentials: 'include', 
      body: JSON.stringify({ 
          filmId: filmId, 
          text: text, 
          parentReplyId: reviewId 
      }),
    });

    if (!response.ok) return handleApiError(response);
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

export const likeReview = async (reviewId: number): Promise<void> => {

    const csrf = await getCsrf();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LIKE_REVIEW(reviewId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        credentials: 'include',
        body: JSON.stringify({ reviewId, type: 'LIKE' })
    });

    if (!response.ok) {
      return handleApiError(response);
    }
};

export const dislikeReview = async (reviewId: number): Promise<void> => {

    const csrf = await getCsrf();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LIKE_REVIEW(reviewId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        credentials: 'include',
        body: JSON.stringify({ reviewId, type: 'DISLIKE' })
    });

    if (!response.ok) {
      return handleApiError(response);
    }
};