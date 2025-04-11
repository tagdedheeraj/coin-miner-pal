
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/auth';

interface PinFormProps {
  user: User;
  onCancel: () => void;
  onSubmit: (pin: string) => Promise<void>;
}

const PinForm: React.FC<PinFormProps> = ({ user, onCancel, onSubmit }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const handleSubmit = async () => {
    if (!pin || !confirmPin) {
      toast.error('Please fill in all PIN fields');
      return;
    }
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast.error('PIN must be a 4-digit number');
      return;
    }
    
    try {
      await onSubmit(pin);
      setPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('Failed to set up PIN:', error);
    }
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-scale-up">
      <Input
        type="password"
        placeholder="Enter 4-digit PIN"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
        className="h-11"
      />
      <Input
        type="password"
        placeholder="Confirm PIN"
        maxLength={4}
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
        className="h-11"
      />
      <div className="flex space-x-2 pt-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
          onClick={handleSubmit}
        >
          {user.hasSetupPin ? 'Update' : 'Set PIN'}
        </Button>
      </div>
    </div>
  );
};

export default PinForm;
