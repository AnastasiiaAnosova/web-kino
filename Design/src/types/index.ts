// Film types
export interface Film {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  duration: string;
  image: string;
  showtimes: Showtime[];
  description: string;
  country?: string;
  language?: string;
  awards?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Showtime {
  id: string;
  date: string;
  time: string;
  available: boolean;
  price?: number;
  hallId?: number;
}

// Review types
export interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  likes: number;
  dislikes: number;
  replies: Reply[];
}

export interface Reply {
  id: number;
  author: string;
  date: string;
  text: string;
  likes: number;
  dislikes: number;
  replies?: Reply[];
}

// User types
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  password: string;
  avatar: string | null;
  memberSince: string;
  loyaltyPoints: number;
}

// Booking types
export interface BookingState {
  selectedFilmId: string | null;
  selectedShowtimeId: string | null;
  selectedSeats: string[];
  customerData: CustomerData;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

// Seat types
export type SeatStatus = 'available' | 'occupied' | 'selected';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface Screening {
  id: number;
  date: string; 
  time: string;
  cena: number;
  id_sal: number;
}