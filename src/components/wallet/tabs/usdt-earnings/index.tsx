
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import UsdtEarningsHeader from './UsdtEarningsHeader';
import UsdtBalanceCard from './UsdtBalanceCard';
import UsdtAddressForm from './UsdtAddressForm';
import UsdtWithdrawalForm from './UsdtWithdrawalForm';
import UsdtEarningsHistory from './UsdtEarningsHistory';

const UsdtEarningsTab: React.FC = () => {
  const { user, setWithdrawalAddress, requestWithdrawal } = useAuth();
  const [showUsdtAddressForm, setShowUsdtAddressForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  
  if (!user) return null;
  
  // Calculate available USDT balance
  const availableUsdtBalance = user?.usdtEarnings || 0;
  
  // Placeholder for earnings data - would be replaced with real data
  const mockUsdtEarnings = [];
  
  const handleUsdtWithdrawal = () => {
    if (!user?.withdrawalAddress) {
      toast.error('Please set a USDT withdrawal address first');
      setShowUsdtAddressForm(true);
      return;
    }
    
    setShowWithdrawalForm(true);
  };
  
  const handleSetUsdtAddress = (address: string) => {
    setWithdrawalAddress(address);
    setShowUsdtAddressForm(false);
    toast.success('USDT withdrawal address updated');
  };
  
  const handleWithdrawal = async (amount: number) => {
    await requestWithdrawal(amount);
    setShowWithdrawalForm(false);
    toast.success('Your withdrawal request has been submitted and is pending approval');
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
      <UsdtEarningsHeader />
      
      <UsdtBalanceCard 
        balance={availableUsdtBalance}
        onWithdrawalClick={handleUsdtWithdrawal}
        onAddressClick={() => setShowUsdtAddressForm(!showUsdtAddressForm)}
      />
      
      {showUsdtAddressForm && (
        <UsdtAddressForm onSetAddress={handleSetUsdtAddress} />
      )}
      
      {showWithdrawalForm && (
        <UsdtWithdrawalForm 
          availableBalance={availableUsdtBalance}
          onWithdraw={handleWithdrawal}
          onCancel={() => setShowWithdrawalForm(false)}
        />
      )}
      
      <UsdtEarningsHistory earningsData={mockUsdtEarnings} />
    </div>
  );
};

export default UsdtEarningsTab;
