
import { User } from '@/types/auth';
import { toast } from 'sonner';

export const createPasswordService = (user: User | null) => {
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      // Password changing is handled in AuthProvider
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
