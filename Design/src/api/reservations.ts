import { API_BASE_URL, API_ENDPOINTS, getApiHeaders, handleApiError, USE_MOCK_DATA } from './config';

export const getOccupiedSeats = async (showtimeId: string): Promise<string[]> => {
  if (USE_MOCK_DATA) return ['A5', 'B3', 'B4'];

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_OCCUPIED_SEATS(showtimeId)}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      return handleApiError(response); // throw
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.occupiedSeats || []);
  } catch (error) {
    console.error('Error fetching occupied seats:', error);
    return [];
  }
};

export const createReservation = async (bookingData: {
  filmId: string;
  showtimeId: string;
  seats: string[];
  customerData: { name: string; email: string; phone: string };
}): Promise<{ id: string; ticketNumber: string; status: string }> => {
  const mockResponse = {
    id: `R${Date.now()}`,
    ticketNumber: Math.floor(Math.random() * 900000 + 100000).toString(),
    status: 'confirmed',
  };

  if (USE_MOCK_DATA) return mockResponse;

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESERVE_GUEST}`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating reservation:', error);
    return mockResponse;
  }
};
