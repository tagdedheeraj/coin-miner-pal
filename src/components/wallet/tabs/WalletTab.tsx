
import React, { useState } from 'react';
import { Wallet, CreditCard, Lock, Check, Copy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { formatCoins, formatUSD, formatWalletAddress, formatToIndianTime } from '@/utils/formatters';
import { toast } from 'sonner';

const WalletTab: React.FC = () => {
  const { user, setWithdrawalAddress } = useAuth();
  const [withdrawalAddressInput, setWithdrawalAddressInput] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  if (!user) return null;
  
  const handleInfiniumWithdrawal = () => {
    toast.error('Infinium coins are locked and cannot be withdrawn');
  };
  
  const handleSetAddress = () => {
    if (!withdrawalAddressInput.trim()) {
      toast.error('Please enter a valid BEP-20 address');
      return;
    }
    
    setWithdrawalAddress(withdrawalAddressInput);
    setShowAddressForm(false);
    setWithdrawalAddressInput('');
    toast.success('Infinium coin withdrawal address updated');
  };
  
  const copyAddress = () => {
    if (!user?.withdrawalAddress) return;
    
    navigator.clipboard.writeText(user.withdrawalAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
    toast.success('Address copied to clipboard');
  };
  
  // Only show the recent signup bonus if coins are exactly 200 (most likely a new account)
  const recentTransactions = [];
  if (user.coins === 200) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    recentTransactions.push({
      id: 'signup-bonus',
      type: 'Signup bonus',
      amount: 200,
      date: yesterday.toISOString(),
      icon: Gift,
      iconBg: 'bg-brand-pink/10',
      iconColor: 'text-brand-pink'
    });
  }
  
  return (
    <>
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center mr-3">
            <Wallet className="text-brand-green" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Your Balance</h3>
            <p className="text-sm text-gray-500">Infinium Coin (Locked)</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-brand-blue to-brand-indigo rounded-xl p-5 mb-6 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-white/70 mb-1">Available Balance</p>
              <p className="text-2xl font-bold">{formatCoins(user.coins || 0)}</p>
              <p className="text-sm text-white/70">{formatUSD(user.coins || 0)}</p>
            </div>
            <div className="flex items-center">
              <Lock className="mr-2 text-white/70" size={16} />
              <div className="coin">₹</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
              onClick={handleInfiniumWithdrawal}
            >
              <Lock size={16} className="mr-2" />
              Locked
            </Button>
            <Button 
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
              onClick={() => setShowAddressForm(!showAddressForm)}
            >
              <CreditCard size={16} className="mr-2" />
              Address
            </Button>
          </div>
        </div>
        
        {showAddressForm && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl animate-scale-up">
            <p className="font-medium text-sm mb-2">Withdrawal Address (BEP-20)</p>
            <div className="flex space-x-2">
              <Input 
                value={withdrawalAddressInput}
                onChange={(e) => setWithdrawalAddressInput(e.target.value)}
                placeholder="Enter your BEP-20 address"
                className="flex-1"
              />
              <Button onClick={handleSetAddress}>Save</Button>
            </div>
          </div>
        )}
        
        {user.withdrawalAddress && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Your withdrawal address</p>
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
              <p className="text-sm font-mono">{formatWalletAddress(user.withdrawalAddress)}</p>
              <button 
                onClick={copyAddress}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                {addressCopied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 p-4 rounded-xl">
          <p className="text-sm text-yellow-700 font-medium flex items-center">
            <Lock size={16} className="mr-2 text-yellow-600" />
            Infinium coins are locked and cannot be withdrawn
          </p>
          <p className="text-xs text-yellow-600 mt-1">1 Infinium coin = $0.02 USD (for reference only)</p>
        </div>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-6">Transaction History</h3>
        
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${tx.iconBg} flex items-center justify-center mr-3`}>
                    <tx.icon size={16} className={tx.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.type}</p>
                    <p className="text-xs text-gray-500">{formatToIndianTime(tx.date)}</p>
                  </div>
                </div>
                <p className="font-medium text-brand-pink">+{tx.amount.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet</p>
              <p className="text-sm mt-2">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletTab;
