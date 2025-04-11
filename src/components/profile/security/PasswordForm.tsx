
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordFormProps {
  onCancel: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onCancel, onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      await onSubmit(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-scale-up">
      <Input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="h-11"
      />
      <Input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="h-11"
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
          Update
        </Button>
      </div>
    </div>
  );
};

export default PasswordForm;
