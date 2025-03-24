
import React, { useState } from 'react';
import { Wallet, CreditCard, ArrowUpRight, Download, Copy, Check, Gift, Lock, BarChart4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatCoins, formatUSD, formatWalletAddress } from '@/utils/formatters';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for USDT earnings from arbitrage plans
const mockUsdtEarnings = [
  { id: 'e-1', planName: 'Arbitrage Plan', amount: 0.96, date: '2023-05-13 09:30:00', status: 'credited' },
  { id: 'e-2', planName: 'Arbitrage Plan', amount: 0.96, date: '2023-05-14 09:30:00', status: 'credited' },
  { id: 'e-3', planName: 'Arbitrage Plan', amount: 0.96, date: '2023-05-15 09:30:00', status: 'credited' },
  { id: 'e-4', planName: 'Arbitrage Plan', amount: 0.96, date: '2023-05-16 09:30:00', status: 'credited' }
];

// Format date to Indian Time (IST)
const formatToIndianTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const WalletCard: React.FC = () => {
  const { user, setWithdrawalAddress } = useAuth();
  const [withdrawalAddressInput, setWithdrawalAddressInput] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  
  // Calculate total USDT earnings
  const totalUsdtEarnings = mockUsdtEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  
  const handleWithdrawal = () => {
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
      <Tabs defaultValue="wallet" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="usdt-earnings">
            <BarChart4 className="h-4 w-4 mr-2" />
            USDT Earnings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="mt-0">
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
                  onClick={handleWithdrawal}
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
        </TabsContent>
        
        <TabsContent value="usdt-earnings" className="mt-0">
          <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <BarChart4 className="text-green-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">USDT Earnings</h3>
                <p className="text-sm text-gray-500">From Arbitrage Plan</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-5 mb-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-white/70 mb-1">Total USDT Earned</p>
                  <p className="text-2xl font-bold">${totalUsdtEarnings.toFixed(2)}</p>
                  <p className="text-sm text-white/70">From Arbitrage Plan</p>
                </div>
                <div className="p-2 bg-white/10 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#26A17B"/>
                    <path d="M13.7566 9.54V7.2H17.0366V4.8H7.07661V7.2H10.3566V9.54C7.43661 9.78 5.27661 10.56 5.27661 11.48C5.27661 12.4 7.43661 13.18 10.3566 13.42V19.2H13.7566V13.42C16.6766 13.18 18.8366 12.4 18.8366 11.48C18.8366 10.56 16.6766 9.78 13.7566 9.54ZM13.7566 12.8V12.82C13.6959 12.8207 13.3126 12.86 12.0566 12.86C11.0126 12.86 10.4166 12.82 10.3566 12.82V12.8C7.74661 12.6 5.87661 12 5.87661 11.3C5.87661 10.6 7.74661 10 10.3566 9.8V12.2C10.4186 12.2067 11.0206 12.26 12.0766 12.26C13.3126 12.26 13.6966 12.2 13.7366 12.2V9.8C16.3466 10 18.2166 10.6 18.2166 11.3C18.2166 12 16.3466 12.6 13.7566 12.8Z" fill="white"/>
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="ghost" 
                  className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
                  onClick={() => setActiveTab('wallet')}
                >
                  <CreditCard size={16} className="mr-2" />
                  Manage Withdrawal Address
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-4">Earnings History</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date (IST)</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsdtEarnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell className="font-medium">{formatToIndianTime(earning.date)}</TableCell>
                        <TableCell>{earning.planName}</TableCell>
                        <TableCell className="text-right text-green-600">${earning.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletCard;
