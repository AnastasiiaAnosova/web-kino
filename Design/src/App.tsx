import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { FilmDetail } from './pages/FilmDetail';
import { Reservation } from './pages/Reservation';
import { Payment } from './pages/Payment';
import { Register } from './pages/Register';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/film/:id" element={<FilmDetail />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}