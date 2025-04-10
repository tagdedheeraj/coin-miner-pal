
import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth/AuthProvider';

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (context === undefined) {
      console.error('useAuth must be used within an AuthProvider');
      // Return default values to prevent app crashes
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    }
    return context;
  } catch (error) {
    console.error('Error in useAuth hook:', error);
    // Return default values to prevent app crashes
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: true
    };
  }
};
