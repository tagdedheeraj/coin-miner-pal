
import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth/AuthProvider';

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (context === undefined) {
      console.error('useAuth must be used within an AuthProvider');
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    }
    return context;
  } catch (error) {
    console.error('Error in useAuth hook:', error);
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
  }
};
