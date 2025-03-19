
import React, { useState } from 'react';
import { Wallet, CreditCard, ArrowUpRight, Download, Copy, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatCoins, formatUSD, formatWalletAddress } from '@/utils/formatters';
import { toast } from 'sonner';

const WalletCard: React.FC = () => {
  const { user, setWithdrawalAddress } = useAuth();
  const [withdrawalAddressInput, setWithdrawalAddressInput] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const handleWithdrawal = () => {
    if (!user) return;
    
    const withdrawalAmountUSD = (user.coins || 0) * 0.02;
    
    if (withdrawalAmountUSD < 100) {
      toast.error(`Minimum withdrawal is $100. You have ${formatUSD(user.coins || 0)}`);
      return;
    }
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      setShowAddressForm(true);
      return;
    }
    
    toast.success('Withdrawal request submitted! It will be processed within 24 hours.');
  };
  
  const handleSetAddress = () => {
    if (!withdrawalAddressInput.trim()) {
      toast.error('Please enter a valid BEP-20 address');
      return;
    }
    
    setWithdrawalAddress(withdrawalAddressInput);
    setShowAddressForm(false);
    setWithdrawalAddressInput('');
  };
  
  const copyAddress = () => {
    if (!user?.withdrawalAddress) return;
    
    navigator.clipboard.writeText(user.withdrawalAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
    toast.success('Address copied to clipboard');
  };
  
  if (!user) return null;
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center mr-3">
            <Wallet className="text-brand-green" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Your Balance</h3>
            <p className="text-sm text-gray-500">Infinium Coin</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-brand-blue to-brand-indigo rounded-xl p-5 mb-6 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-white/70 mb-1">Available Balance</p>
              <p className="text-2xl font-bold">{formatCoins(user.coins || 0)}</p>
              <p className="text-sm text-white/70">{formatUSD(user.coins || 0)}</p>
            </div>
            <div className="coin">₹</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
              onClick={handleWithdrawal}
            >
              <ArrowUpRight size={16} className="mr-2" />
              Withdraw
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
          <p className="text-sm text-yellow-700 font-medium">Minimum withdrawal: $100</p>
          <p className="text-xs text-yellow-600 mt-1">1 Infinium coin = $0.02 USD</p>
        </div>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-6">Transaction History</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center mr-3">
                <Download size={16} className="text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-medium">Mining reward</p>
                <p className="text-xs text-gray-500">Today, 09:45 AM</p>
              </div>
            </div>
            <p className="font-medium text-brand-green">+48.00</p>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center mr-3">
                <Gift size={16} className="text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-medium">Ad reward</p>
                <p className="text-xs text-gray-500">Today, 08:30 AM</p>
              </div>
            </div>
            <p className="font-medium text-brand-blue">+1.00</p>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center mr-3">
                <Gift size={16} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-sm font-medium">Signup bonus</p>
                <p className="text-xs text-gray-500">Yesterday, 02:15 PM</p>
              </div>
            </div>
            <p className="font-medium text-brand-pink">+200.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
