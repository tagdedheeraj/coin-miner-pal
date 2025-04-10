
import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth/AuthProvider';
import { FullAuthContextType } from '@/contexts/auth/types';

export const useAuth = (): FullAuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
