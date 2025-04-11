
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const changePassword = async (user: User | null, currentPassword: string, newPassword: string) => {
  if (!user) throw new Error('Not authenticated');
  if (user.isAdmin) throw new Error('Admin password cannot be changed');
  
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('Firebase user not found');
    }
    
    // Verify current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(firebaseUser, credential);
    
    // Update password
    await updatePassword(firebaseUser, newPassword);
    
    toast.success('Password changed successfully');
  } catch (error) {
    console.error(error);
    let errorMessage = 'Failed to change password';
    
    if (error instanceof Error) {
      if (error.message.includes('auth/wrong-password')) {
        errorMessage = 'Current password is incorrect';
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = 'New password is too weak';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    throw error;
  }
};
