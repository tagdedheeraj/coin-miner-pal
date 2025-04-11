
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UsdtAddressFormProps {
  onSetAddress: (address: string) => void;
}

const UsdtAddressForm: React.FC<UsdtAddressFormProps> = ({ onSetAddress }) => {
  const [usdtAddressInput, setUsdtAddressInput] = useState('');
  
  const handleSetUsdtAddress = () => {
    if (!usdtAddressInput.trim()) {
      toast.error('Please enter a valid BEP-20 address for USDT');
      return;
    }
    
    onSetAddress(usdtAddressInput);
    setUsdtAddressInput('');
  };
  
  return (
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
  );
};

export default UsdtAddressForm;
