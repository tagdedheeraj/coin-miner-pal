
import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/auth/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Memoize the context so it doesn't cause unnecessary re-renders
  return useMemo(() => context, [context]);
};
