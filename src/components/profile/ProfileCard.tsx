
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserInfoCard from './UserInfoCard';
import SecuritySection from './security/SecuritySection';

const ProfileCard: React.FC = () => {
  const { user, signOut, changePassword, setupPin, toggleBiometrics } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="w-full">
      <UserInfoCard user={user} signOut={signOut} />
      <SecuritySection 
        user={user}
        changePassword={changePassword}
        setupPin={setupPin}
        toggleBiometrics={toggleBiometrics}
      />
    </div>
  );
};

export default ProfileCard;
