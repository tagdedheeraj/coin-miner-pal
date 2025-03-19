
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCoins } from '@/utils/formatters';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => {/* Show notifications */}}
            >
              <Bell size={20} />
            </button>
            
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
