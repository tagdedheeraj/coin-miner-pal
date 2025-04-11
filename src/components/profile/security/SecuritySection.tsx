
import React, { useState } from 'react';
import { LockKeyhole, Fingerprint } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/auth';
import SecurityItem from './SecurityItem';
import PasswordForm from './PasswordForm';
import PinForm from './PinForm';

interface SecuritySectionProps {
  user: User;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  toggleBiometrics: () => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  user,
  changePassword,
  setupPin,
  toggleBiometrics
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
    setShowPasswordForm(false);
  };
  
  const handleSetupPin = async (pin: string) => {
    await setupPin(pin);
    setShowPinForm(false);
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up animation-delay-100">
      <h3 className="font-semibold text-lg mb-4">Security</h3>
      
      <div className="space-y-4">
        <SecurityItem
          icon={<LockKeyhole className="text-yellow-600" size={16} />}
          title="Change Password"
          description="Update your account password"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        />
        
        {showPasswordForm && (
          <PasswordForm 
            onCancel={() => setShowPasswordForm(false)}
            onSubmit={handleChangePassword}
          />
        )}
        
        <SecurityItem
          icon={<LockKeyhole className="text-purple-600" size={16} />}
          title="PIN Setup"
          description={user.hasSetupPin ? 'Change your security PIN' : 'Set up a security PIN'}
          onClick={() => setShowPinForm(!showPinForm)}
        />
        
        {showPinForm && (
          <PinForm 
            user={user}
            onCancel={() => setShowPinForm(false)}
            onSubmit={handleSetupPin}
          />
        )}
        
        <SecurityItem
          icon={<Fingerprint className="text-blue-600" size={16} />}
          title="Biometric Authentication"
          description="Use fingerprint or face ID"
          rightElement={
            <Switch 
              checked={user.hasBiometrics} 
              onCheckedChange={toggleBiometrics}
            />
          }
        />
      </div>
    </div>
  );
};

export default SecuritySection;
