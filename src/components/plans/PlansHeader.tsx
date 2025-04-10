
import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface PlansHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PlansHeader: React.FC<PlansHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
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
      
      <div className="flex space-x-2 border-b mb-6">
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'plans' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('plans')}
        >
          Plans
        </button>
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'earnings' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('earnings')}
        >
          Earnings
        </button>
      </div>
    </div>
  );
};

export default PlansHeader;
