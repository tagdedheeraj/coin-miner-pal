
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pickaxe, Gift, Share2, ArrowRight } from 'lucide-react';

const QuickAccessSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
      
      <div className="space-y-3">
        <button 
          className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up"
          onClick={() => navigate('/mining')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center mr-3">
              <Pickaxe className="text-brand-teal" size={20} />
            </div>
            <div>
              <p className="font-medium text-left">Start Mining</p>
              <p className="text-xs text-gray-500">Earn 2 coins per hour</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up animation-delay-100"
          onClick={() => navigate('/rewards')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center mr-3">
              <Gift className="text-brand-pink" size={20} />
            </div>
            <div>
              <p className="font-medium text-left">Watch Ads</p>
              <p className="text-xs text-gray-500">Earn 1 coin per ad</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full glass-card rounded-xl p-4 flex items-center justify-between animate-scale-up animation-delay-200"
          onClick={() => navigate('/referral')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center mr-3">
              <Share2 className="text-brand-indigo" size={20} />
            </div>
            <div>
              <p className="font-medium text-left">Refer Friends</p>
              <p className="text-xs text-gray-500">Earn 250 coins per referral</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default QuickAccessSection;
