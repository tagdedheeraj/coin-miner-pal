
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowUpRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const UsdtEarningsTab: React.FC = () => {
  const navigate = useNavigate();
  const { user, setWithdrawalAddress, requestWithdrawal } = useAuth();
  const [usdtAddressInput, setUsdtAddressInput] = useState('');
  const [showUsdtAddressForm, setShowUsdtAddressForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
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
  
  const processUsdtWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    
    if (amount < 50) {
      toast.error('Minimum withdrawal amount is $50');
      return;
    }
    
    if (amount > availableUsdtBalance) {
      toast.error(`Insufficient balance. You have $${availableUsdtBalance.toFixed(2)} available`);
      return;
    }
    
    try {
      await requestWithdrawal(amount);
      setShowWithdrawalForm(false);
      setWithdrawalAmount('');
      toast.success('Your withdrawal request has been submitted and is pending approval');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process withdrawal');
    }
  };
  
  const handleSetUsdtAddress = () => {
    if (!usdtAddressInput.trim()) {
      toast.error('Please enter a valid BEP-20 address for USDT');
      return;
    }
    
    // In a real app, this would update the user's USDT withdrawal address in the backend
    setWithdrawalAddress(usdtAddressInput); // Using the same function for demo purposes
    setShowUsdtAddressForm(false);
    setUsdtAddressInput('');
    toast.success('USDT withdrawal address updated');
  };
  
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
  
  return (
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
            <p className="text-2xl font-bold">${availableUsdtBalance.toFixed(2)}</p>
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
            onClick={handleUsdtWithdrawal}
          >
            <ArrowUpRight size={16} className="mr-2" />
            Withdraw
          </Button>
          <Button 
            variant="ghost" 
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-12 border-none"
            onClick={() => setShowUsdtAddressForm(!showUsdtAddressForm)}
          >
            <CreditCard size={16} className="mr-2" />
            Address
          </Button>
        </div>
      </div>
      
      {showUsdtAddressForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-xl animate-scale-up">
          <p className="font-medium text-sm mb-2">USDT Withdrawal Address (BEP-20)</p>
          <div className="flex space-x-2">
            <Input 
              value={usdtAddressInput}
              onChange={(e) => setUsdtAddressInput(e.target.value)}
              placeholder="Enter your BEP-20 address for USDT"
              className="flex-1"
            />
            <Button onClick={handleSetUsdtAddress}>Save</Button>
          </div>
        </div>
      )}
      
      {showWithdrawalForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-xl animate-scale-up">
          <p className="font-medium text-sm mb-3">Withdraw USDT (Minimum $50)</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount in USDT</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="50"
                  step="0.01"
                  className="rounded-l-none"
                  placeholder="50.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>• Minimum withdrawal amount: $50</p>
              <p>• Network fee: 1 USDT</p>
              <p>• Processing time: 24 hours</p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="flex-1" 
                onClick={processUsdtWithdrawal}
              >
                Withdraw
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowWithdrawalForm(false);
                  setWithdrawalAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {mockUsdtEarnings.length > 0 ? (
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
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <BarChart4 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium text-gray-800 mb-2">No Earnings Yet</h4>
          <p className="text-sm text-gray-500">
            Purchase an arbitrage plan to start earning USDT daily.
          </p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/plans')}
          >
            View Arbitrage Plans
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsdtEarningsTab;
