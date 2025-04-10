
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatCoins } from '@/utils/formatters';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  const { user, isAuthenticated, markNotificationAsRead } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close notifications
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  // Count unread notifications
  const unreadCount = user?.notifications?.filter(n => !n.read)?.length || 0;
  
  // Handle marking notification as read
  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg z-50 border-b border-slate-100 shadow-sm animate-slide-down">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img 
            src="/lovable-uploads/e6693d03-b7d5-40c8-a973-c0c99c55a8fe.png" 
            alt="Infinium" 
            className="h-10 w-auto"
          />
        </div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1.5 rounded-full bg-brand-blue/10 flex items-center space-x-2">
              <div className="relative w-5 h-5">
                <div className="coin w-5 h-5 text-xs animate-coin-spin">₹</div>
              </div>
              <span className="font-medium text-sm text-brand-blue">
                {formatCoins(user.coins)}
              </span>
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-medium text-sm">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <ScrollArea className="max-h-[300px]">
                    {user.notifications && user.notifications.length > 0 ? (
                      <div className="py-1">
                        {user.notifications.sort((a, b) => 
                          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        ).map(notification => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <Badge variant="default" className="ml-2 bg-blue-500 h-2 w-2 rounded-full p-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-blue text-white shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate('/profile')}
            >
              <User size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button 
              className="px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-medium text-sm hover:bg-brand-blue/20 transition-colors"
              onClick={() => navigate('/sign-in')}
            >
              Sign In
            </button>
            <button 
              className="px-4 py-1.5 rounded-full bg-brand-blue text-white font-medium text-sm shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate('/sign-up')}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
