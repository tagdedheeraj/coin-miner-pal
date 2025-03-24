
import React, { useState } from 'react';
import { User, LockKeyhole, Fingerprint, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ProfileCard: React.FC = () => {
  const { user, signOut, changePassword, setupPin, toggleBiometrics } = useAuth();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };
  
  const handleSetupPin = async () => {
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
      await setupPin(pin);
      setShowPinForm(false);
      setPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('Failed to set up PIN:', error);
    }
  };
  
  const handleToggleBiometrics = async () => {
    try {
      await toggleBiometrics();
    } catch (error) {
      console.error('Failed to toggle biometrics:', error);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl mr-4">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-xl">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={signOut}
          className="w-full rounded-xl h-12 border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-4">Security</h3>
        
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                <LockKeyhole className="text-yellow-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          {showPasswordForm && (
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
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
                  onClick={handleChangePassword}
                >
                  Update
                </Button>
              </div>
            </div>
          )}
          
          <div 
            className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer"
            onClick={() => setShowPinForm(!showPinForm)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <LockKeyhole className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">PIN Setup</p>
                <p className="text-xs text-gray-500">
                  {user.hasSetupPin ? 'Change your security PIN' : 'Set up a security PIN'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          {showPinForm && (
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
                  onClick={() => setShowPinForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
                  onClick={handleSetupPin}
                >
                  {user.hasSetupPin ? 'Update' : 'Set PIN'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <Fingerprint className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Biometric Authentication</p>
                <p className="text-xs text-gray-500">Use fingerprint or face ID</p>
              </div>
            </div>
            <Switch 
              checked={user.hasBiometrics} 
              onCheckedChange={handleToggleBiometrics}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
