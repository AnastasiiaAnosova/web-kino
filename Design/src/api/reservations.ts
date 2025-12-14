import { BookingState } from '../types';
import { API_BASE_URL, API_ENDPOINTS, getApiHeaders, handleApiError, USE_MOCK_DATA } from './config';

/**
 * Získání obsazených sedadel pro představení
 */
export const getOccupiedSeats = async (showtimeId: string): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return ['A5', 'B3', 'B4', 'C7', 'D2', 'E9', 'F5', 'G3', 'H8', 'I1', 'J6'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_OCCUPIED_SEATS(showtimeId)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.occupiedSeats || data;
  } catch (error) {
    console.error('Error fetching occupied seats:', error);
    return ['A5', 'B3', 'B4', 'C7', 'D2', 'E9', 'F5', 'G3', 'H8', 'I1', 'J6'];
  }
};

/**
 * Vytvoření rezervace
 */
export const createReservation = async (bookingData: any): Promise<{ id: string; ticketNumber: string; status: string }> => {
  const mockResponse = {
    id: `R${Date.now()}`,
    ticketNumber: Math.floor(Math.random() * 900000 + 100000).toString(),
    status: 'confirmed'
  };

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResponse;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_RESERVATION}`, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    return mockResponse;
  }
};

/**
 * Získání detailů rezervace
 */
export const getReservationDetails = async (reservationId: string): Promise<any | null> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_RESERVATION(reservationId)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    return data.reservation || data;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }
};

/**
 * Zrušení rezervace
 */
export const cancelReservation = async (reservationId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_RESERVATION(reservationId)}`, {
      method: 'DELETE',
      headers: getApiHeaders(true),
    });

    return response.ok;
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return false;
  }
};