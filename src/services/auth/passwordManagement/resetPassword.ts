
import { auth } from '@/integrations/firebase/client';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'sonner';

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    let errorMessage = 'Failed to send password reset email';
    
    if (error instanceof Error) {
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email address';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('auth/network-request-failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again';
      }
    }
    
    toast.error(errorMessage);
    throw error;
  }
};
