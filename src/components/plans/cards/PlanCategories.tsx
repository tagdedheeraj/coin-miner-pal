
import React from 'react';
import { ChevronRight } from 'lucide-react';

const PlanCategories: React.FC = () => {
  return (
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
  );
};

export default PlanCategories;
