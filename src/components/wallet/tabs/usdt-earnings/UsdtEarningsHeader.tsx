
import React from 'react';
import { BarChart4 } from 'lucide-react';

const UsdtEarningsHeader: React.FC = () => {
  return (
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
        <BarChart4 className="text-green-500" size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-lg">USDT Earnings</h3>
        <p className="text-sm text-gray-500">From Arbitrage Plan</p>
      </div>
    </div>
  );
};

export default UsdtEarningsHeader;
