
import React from 'react';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlansCard: React.FC = () => {
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center mr-3">
            <LayoutGrid className="text-brand-orange" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mining Plans</h3>
            <p className="text-sm text-gray-500">Boost your mining power</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-brand-blue">
            <p className="font-medium">Coming Soon!</p>
            <p className="text-sm text-gray-500 mt-1">
              Boosting plans and arbitrage plans will be available soon.
            </p>
          </div>
        </div>
        
        <Button 
          disabled
          className="w-full rounded-xl h-12 bg-brand-orange hover:bg-brand-orange/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Coming Soon
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-6">Plan Categories</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Boosting Plans</p>
              <p className="text-xs text-gray-500">Increase your mining rate</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Arbitrage Plans</p>
              <p className="text-xs text-gray-500">Profit from market differences</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Special Offers</p>
              <p className="text-xs text-gray-500">Limited time opportunities</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansCard;
