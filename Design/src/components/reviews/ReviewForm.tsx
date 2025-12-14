import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ReviewFormProps {
  onSubmit: (rating: number, text: string, author: string) => void;
}

export const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Prosím, vyberte hodnocení (počet hvězdiček)');
      return;
    }
    
    if (text.trim().length < 10) {
      alert('Recenze musí obsahovat alespoň 10 znaků');
      return;
    }

    const authorName = user 
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymní divák';

    onSubmit(rating, text.trim(), authorName);
    
    // Reset form
    setRating(0);
    setText('');
  };

  return (
    <div className="relative mb-8">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#912D3C] to-[#912D3C]/50 transform rotate-1" />
      
      <div className="relative bg-white border-4 border-black p-6">
        <h3 className="font-display text-lg tracking-wider mb-4">NAPIŠTE RECENZI</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block font-display text-sm tracking-wider mb-2">
              VAŠE HODNOCENÍ *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#912D3C] text-[#912D3C]'
                        : 'fill-none text-gray-400'
                    }`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="block font-display text-sm tracking-wider mb-2">
              VÁŠ NÁZOR *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Podělte se o své dojmy z filmu..."
              required
              className="w-full px-4 py-3 border-2 border-gray-300 bg-[#f8f8f8] font-serif text-sm focus:border-[#912D3C] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#912D3C] text-white font-display text-sm tracking-wider hover:bg-[#A43D4C] transition-colors border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.4)] active:shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
          >
            ODESLAT RECENZI
          </button>
        </form>
      </div>
    </div>
  );
};