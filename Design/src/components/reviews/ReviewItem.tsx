import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Review, Reply } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface ReviewItemProps {
  review: Review;
  onLike?: () => void;
  onDislike?: () => void;
  onReply?: (reviewId: number, text: string, author: string) => void;
  onReplyToReply?: (reviewId: number, replyId: number, text: string, author: string) => void;
}

export const ReviewItem = ({ review, onLike, onDislike, onReply, onReplyToReply }: ReviewItemProps) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (replyText.trim().length < 5) {
      alert('Odpověď musí obsahovat alespoň 5 znaků');
      return;
    }

    const authorName = user 
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymní';

    if (onReply) {
      onReply(review.id, replyText.trim(), authorName);
    }
    setReplyText('');
    setShowReplyForm(false);
  };

  const handleLike = () => {
    if (onLike) {
      onLike();
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike();
    }
  };

  const handleNestedReply = (replyId: number, text: string, author: string) => {
    if (onReplyToReply) {
      onReplyToReply(review.id, replyId, text, author);
    }
  };

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gray-200 transform rotate-1" />
      
      <div className="relative bg-white border-2 border-black p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-display font-semibold tracking-wider">{review.author}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'fill-[#912D3C] text-[#912D3C]'
                        : 'fill-none text-gray-400'
                    }`}
                    strokeWidth={2}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <p className="font-serif text-gray-700 leading-relaxed mb-4">{review.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-[#912D3C] transition-colors"
          >
            <ThumbsUp className="w-4 h-4" strokeWidth={2} />
            <span>{review.likes}</span>
          </button>
          
          <button
            onClick={handleDislike}
            className="flex items-center gap-1 hover:text-[#912D3C] transition-colors"
          >
            <ThumbsDown className="w-4 h-4" strokeWidth={2} />
            <span>{review.dislikes}</span>
          </button>
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 hover:text-[#912D3C] transition-colors"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            <span>Odpovědět</span>
          </button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-300">
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Napište odpověď..."
                className="w-full p-2 border-2 border-gray-300 focus:border-[#912D3C] focus:outline-none min-h-[80px] resize-y mb-2 font-serif"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#912D3C] text-white border-2 border-black font-display tracking-wider hover:bg-[#A43D4C] transition-colors text-xs"
                >
                  ODESLAT
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 bg-gray-300 text-black border-2 border-black font-display tracking-wider hover:bg-gray-400 transition-colors text-xs"
                >
                  ZRUŠIT
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 pl-8 space-y-3 border-l-2 border-[#912D3C]">
            {review.replies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} onReply={handleNestedReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Reply component
const ReplyItem = ({ reply, onReply }: { reply: Reply, onReply?: (replyId: number, text: string, author: string) => void }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  const handleNestedReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (replyText.trim().length < 5) {
      alert('Odpověď musí obsahovat alespoň 5 znaků');
      return;
    }

    const authorName = user 
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymní';

    if (onReply) {
      onReply(reply.id, replyText.trim(), authorName);
    }
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div className="bg-gray-50 border border-gray-300 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-medium text-sm">{reply.author}</span>
        <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
      </div>
      <p className="font-serif text-gray-700 text-sm mb-2">{reply.text}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {/* Pro jednoduchost není třeba mít like/dislike u odpovědí*/}
        {/* <button className="flex items-center gap-1 hover:text-[#912D3C] transition-colors">
          <ThumbsUp className="w-3 h-3" strokeWidth={2} />
          <span>{reply.likes}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[#912D3C] transition-colors">
          <ThumbsDown className="w-3 h-3" strokeWidth={2} />
          <span>{reply.dislikes}</span>
        </button> */}
        
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1 hover:text-[#912D3C] transition-colors"
        >
          <MessageCircle className="w-3 h-3" strokeWidth={2} />
          <span>Odpovědět</span>
        </button>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 p-3 bg-white border-2 border-gray-300">
          <form onSubmit={handleNestedReplySubmit}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Napište odpověď..."
              className="w-full p-2 border-2 border-gray-300 focus:border-[#912D3C] focus:outline-none min-h-[60px] resize-y mb-2 font-serif text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-[#912D3C] text-white border border-black font-display tracking-wider hover:bg-[#A43D4C] transition-colors text-xs"
              >
                ODESLAT
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1 bg-gray-300 text-black border border-black font-display tracking-wider hover:bg-gray-400 transition-colors text-xs"
              >
                ZRUŠIT
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-3 pl-4 space-y-2 border-l-2 border-gray-300">
          {reply.replies.map((nestedReply) => (
            <div key={nestedReply.id} className="bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-medium text-xs">{nestedReply.author}</span>
                <span className="text-xs text-gray-400">{formatDate(nestedReply.date)}</span>
              </div>
              <p className="font-serif text-gray-700 text-xs">{nestedReply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};