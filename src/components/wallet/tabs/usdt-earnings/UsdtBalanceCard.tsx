
import React from 'react';
import { ArrowUpRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsdtBalanceCardProps {
  balance: number;
  onWithdrawalClick: () => void;
  onAddressClick: () => void;
}

const UsdtBalanceCard: React.FC<UsdtBalanceCardProps> = ({ 
  balance, 
  onWithdrawalClick, 
  onAddressClick 
}) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-5 mb-6 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-white/70 mb-1">Total USDT Earned</p>
          <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
          <p className="text-sm text-white/70">Available for withdrawal</p>
        </div>
        <div className="p-2 bg-white/10 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#26A17B"/>
            <path d="M13.7566 9.54V7.2H17.0366V4.8H7.07661V7.2H10.3566V9.54C7.43661 9.78 5.27661 10.56 5.27661 11.48C5.27661 12.4 7.43661 13.18 10.3566 13.42V19.2H13.7566V13.42C16.6766 13.18 18.8366 12.4 18.8366 11.48C18.8366 10.56 16.6766 9.78 13.7566 9.54ZM13.7566 12.8V12.82C13.6959 12.8207 13.3126 12.86 12.0566 12.86C11.0126 12.86 10.4166 12.82 10.3566 12.82V12.8C7.74661 12.6 5.87661 12 5.87661 11.3C5.87661 10.6 7.74661 10 10.3566 9.8V12.2C10.4186 12.2067 11.0206 12.26 12.0766 12.26C13.3126 12.26 13.6966 12.2 13.7366 12.2V9.8C16.3466 10 18.2166 10.6 18.2166 11.3C18.2166 12 16.3466 12.6 13.7566 12.8Z" fill="white"/>
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="ghost" 
          className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
          onClick={onWithdrawalClick}
        >
          <ArrowUpRight size={16} className="mr-2" />
          Withdraw
        </Button>
        <Button 
          variant="ghost" 
          className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
          onClick={onAddressClick}
        >
          <CreditCard size={16} className="mr-2" />
          Address
        </Button>
      </div>
    </div>
  );
};

export default UsdtBalanceCard;
