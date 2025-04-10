
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

const Withdrawal = () => {
  const { user, requestWithdrawal, setWithdrawalAddress } = useAuth();

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const amount = Number(form.amount.value);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!user?.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    requestWithdrawal(amount)
      .then(() => {
        form.reset();
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to request withdrawal');
      });
  };

  const handleSetAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const address = form.address.value;
    
    if (!address) {
      toast.error('Please enter a valid address');
      return;
    }
    
    setWithdrawalAddress(address)
      .then(() => {
        toast.success('Withdrawal address updated successfully');
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to set withdrawal address');
      });
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Withdrawal</h1>
      
      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
          <TabsTrigger value="settings">Withdrawal Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="withdraw" className="p-4 border rounded-lg">
          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USDT)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
            
            {user?.withdrawalAddress ? (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm font-medium">Withdrawal Address:</p>
                <p className="text-xs text-gray-500 break-all">{user.withdrawalAddress}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-md text-yellow-700 mb-4">
                <p className="text-sm">Please set a withdrawal address in the settings tab.</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={!user?.withdrawalAddress}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Request Withdrawal
            </button>
          </form>
        </TabsContent>
        
        <TabsContent value="settings" className="p-4 border rounded-lg">
          <form onSubmit={handleSetAddress} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                USDT Withdrawal Address (TRC-20)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                defaultValue={user?.withdrawalAddress || ''}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your TRC-20 wallet address"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-blue-700 mb-4">
              <p className="text-sm">Make sure to enter a valid USDT TRC-20 wallet address. Incorrect addresses may result in permanent loss of funds.</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Save Address
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Withdrawal;
