import { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSwitchToRegister }: AuthModalProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError('Nepodařilo se přihlásit. Zkontrolujte přihlašovací údaje.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-white to-[#f9f9f9] border-4 border-black p-8 animate-modalSlideIn">
        {/* Ornamental corners */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#912D3C]" />
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#912D3C]" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#912D3C]" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#912D3C]" />

        {/* Decorative borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#912D3C] to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 border-2 border-transparent hover:border-gray-300 hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl tracking-wider border-b-2 border-black pb-2 mb-2">
            PŘIHLÁŠENÍ
          </h2>
          <p className="font-serif text-sm italic text-gray-600">Graphite Kinematograf</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 font-display text-sm tracking-wider mb-2">
              <Mail className="w-4 h-4 text-[#912D3C]" strokeWidth={2} />
              E-MAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 bg-[#f8f8f8] font-serif focus:border-[#912D3C] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-display text-sm tracking-wider mb-2">
              <Lock className="w-4 h-4 text-[#912D3C]" strokeWidth={2} />
              HESLO
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 bg-[#f8f8f8] font-serif focus:border-[#912D3C] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#912D3C] text-white font-display text-sm tracking-widest hover:bg-[#A43D4C] transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.4)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.4)] active:shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
          >
            PŘIHLÁSIT SE
          </button>

          <div className="text-center">
            <p className="font-serif text-sm text-gray-600">
              Nemáte účet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#912D3C] font-semibold hover:text-[#A43D4C] underline"
              >
                Registrujte se
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};