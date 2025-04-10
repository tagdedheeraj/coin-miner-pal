
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const createPasswordService = (user: User | null) => {
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      // Using Firebase to change password
      const currentUser = auth.currentUser;
      
      if (!currentUser || !currentUser.email) {
        throw new Error('Firebase user not authenticated');
      }
      
      // Re-authenticate the user first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
    }
  };
  
  return {
    changePassword
  };
};
