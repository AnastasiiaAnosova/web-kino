import { useState, useEffect } from 'react';
import { X, Mail, Phone, Settings, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMessages, getUnreadCount, Message, markAsRead } from '../../api/messages';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
}

export const ProfileModal = ({ isOpen, onClose, onEditProfile }: ProfileModalProps) => {

  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [usersMessages, setUsersMessages] = useState([] as Message[]);
  const [currentOpenMessage, setCurrentOpenMessage] = useState(-1);
  
  useEffect(() => {

      if (!isOpen || !user) return;

      updateUnreadCount();
      getUsersMesages();
      
  }, [isOpen]);

  // Při změně viditelnosti zpráv
  useEffect(() => {

    if(showNotifications){

      getUsersMesages();
    }
      
  }, [showNotifications]);

  if (!isOpen || !user) return null;

  const getUsersMesages = async () => {
    setUsersMessages(await getMessages("inbox"));
  }

  const updateUnreadCount = async () => {
    setUnreadMessagesCount(await getUnreadCount());
  }

  const handleLogout = () => {
    if (confirm('Opravdu se chcete odhlásit?')) {
      logout();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNotificationPanelClose = async (e: React.MouseEvent) => {
    
    setShowNotifications(false);

  };

  const handleMessageClick = async (message: Message) => {

    setCurrentOpenMessage((currentOpenMessage == message.id) ? -1 : message.id);
    await markAsRead(message.id);

    updateUnreadCount();
    getUsersMesages();
  }


  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-white to-[#f9f9f9] border-4 border-black p-8 max-h-[90vh] overflow-y-auto animate-modalSlideIn">
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
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl tracking-wider border-b-2 border-black pb-2 mb-2">
            MŮJ PROFIL
          </h2>
          <p className="font-serif text-sm italic text-gray-600">Graphite Kinematograf</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-2 border-2 border-black rounded-full" />
            <div className="absolute -inset-1 border-2 border-[#912D3C] rounded-full" />
            <div className="relative w-20 h-20 rounded-full bg-[#f8f8f8] border-2 border-[#912D3C] flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
              )}
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="text-center mb-6">
          <h3 className="font-display text-xl tracking-wider mb-4 pb-4 border-b-2 border-[#912D3C]">
            {user.firstName} {user.lastName}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 p-3 bg-[#f8f8f8] border-2 border-gray-200 hover:border-[#912D3C] transition-colors">
              <Mail className="w-4 h-4 text-[#912D3C]" strokeWidth={2} />
              <span className="font-serif text-sm">{user.email}</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-3 bg-[#f8f8f8] border-2 border-gray-200 hover:border-[#912D3C] transition-colors">
              <Phone className="w-4 h-4 text-[#912D3C]" strokeWidth={2} />
              <span className="font-serif text-sm">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-5 mb-6">
          <button
            onClick={onEditProfile}
            className="p-3 bg-white border-2 border-[#912D3C] hover:bg-[#912D3C] hover:text-white transition-colors shadow-[3px_3px_0px_rgba(145,45,60,0.3)] hover:shadow-[5px_5px_0px_rgba(145,45,60,0.4)]"
            title="Upravit údaje"
          >
            <Settings className="w-5 h-5" strokeWidth={2} />
          </button>
          
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 bg-white border-2 border-[#912D3C] hover:bg-[#912D3C] hover:text-white transition-colors shadow-[3px_3px_0px_rgba(145,45,60,0.3)] hover:shadow-[5px_5px_0px_rgba(145,45,60,0.4)]"
            title="Oznámení"
          >
            <Bell className="w-5 h-5" strokeWidth={2} />
            {unreadMessagesCount > 0 && (
              <span
              style={{transform: 'translate(0.2rem, -0.2rem)'}}
                className="absolute -top-2 -right-2 min-w-[1.25rem] w-6 h-6 px-1 rounded-full bg-[#912D3C] text-white text-xs font-semibold
                  flex items-center justify-center leading-none ring-2 ring-white border-2 border-white shadow-md">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications panel */}
        {showNotifications && (
          <div className="mb-6 bg-[#f8f8f8] border-2 border-black animate-fadeInUp">
            <div className="bg-[#912D3C] p-3 flex justify-between items-center border-b-2 border-black">
              <h4 className="font-display text-sm tracking-wider text-white">OZNÁMENÍ</h4>
              <button
                onClick={(e) => handleNotificationPanelClose(e)}
                className="w-6 h-6 border border-white text-white hover:bg-white hover:text-[#912D3C] transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {usersMessages.length <= 0 && 
              <p className="font-serif text-sm italic text-gray-500 text-center">
                Žádná oznámení
              </p>}
              {usersMessages.length > 0 && 
                usersMessages.map((message) => {
                  return (
                    <div key={message.id} className="flex flex-col mb-2">
                      <div
                        onClick={() => handleMessageClick(message)}
                        key={message.id}
                        className={`flex items-start justify-between gap-3 p-3 mb-2 rounded-md 
                                    ${!message.isRead ? 'bg-[#fef2f2]' : 'bg-white'} 
                                    border border-gray-200 hover:border-[#912D3C] transition-colors`}
                      >
                        {/* Avatar and sender info */}
                        <div className="flex items-center gap-3">
                          {message.otherUser.avatar ? (
                            <img 
                              src={message.otherUser.avatar} 
                              alt={message.otherUser.fullName} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-semibold">
                              {message.otherUser.fullName.charAt(0)}
                            </div>
                          )}

                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-900">{message.otherUser.fullName}</span>
                            <span className="font-serif text-xs text-gray-600">{message.subject}</span>
                          </div>
                        </div>

                        {/* Date and unread indicator */}
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400">{new Date(message.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {!message.isRead && (
                            <span className="mt-1 w-3 h-3 rounded-full bg-[#912D3C] ring-1 ring-white" />
                          )}
                        </div>
                      </div>

                      {/* Expandable content */}
                        {currentOpenMessage == message.id && (
                          <div className="p-3 bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-md text-sm text-gray-700">
                            {message.text}
                          </div>
                        )}
                  </div>);
                })
              }
            </div>
          </div>
        )}

        {/* Logout button */}
        <div className="pt-6 border-t-2 border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-red-600 border-2 border-red-600 font-display text-sm tracking-wider hover:bg-red-600 hover:text-white transition-colors shadow-[4px_4px_0px_rgba(220,38,38,0.3)] hover:shadow-[6px_6px_0px_rgba(220,38,38,0.4)]"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            ODHLÁSIT SE
          </button>
        </div>
      </div>
    </div>
  );
};