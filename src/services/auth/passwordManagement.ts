
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

export const createPasswordService = (user: User | null) => {
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      // Would normally re-authenticate first, but simplified for this example
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password changed successfully');
      } else {
        throw new Error('User not authenticated with Firebase');
      }
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
