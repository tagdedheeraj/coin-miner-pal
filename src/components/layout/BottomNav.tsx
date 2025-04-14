
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pickaxe, Wallet, Gift, Share2, LayoutGrid, MessageCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: Pickaxe, label: 'Mine', path: '/mining' },
    { icon: LayoutGrid, label: 'Plans', path: '/plans' },
    { icon: Gift, label: 'Rewards', path: '/rewards' },
    { icon: Share2, label: 'Refer', path: '/referral' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { 
      icon: MessageCircle, 
      label: 'Support', 
      onClick: () => window.location.href = 'mailto:infiniumnetwork.space',
      path: '#'
    },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg z-50 border-t border-slate-100 shadow-sm animate-slide-up">
      <div className="h-full max-w-md mx-auto px-4 flex items-stretch justify-between">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive(item.path) ? 'text-brand-blue' : 'text-gray-400'
            }`}
            onClick={item.onClick || (() => navigate(item.path))}
          >
            <item.icon 
              size={20} 
              className={`mb-1 ${
                isActive(item.path) 
                  ? 'text-brand-blue animate-pulse-subtle' 
                  : 'text-gray-400'
              }`}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
