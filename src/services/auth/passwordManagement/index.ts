
import { User } from '@/types/auth';
import { changePassword } from './changePassword';
import { resetPassword } from './resetPassword';

export const createPasswordService = (user: User | null) => {
  return {
    changePassword: (currentPassword: string, newPassword: string) => 
      changePassword(user, currentPassword, newPassword),
    resetPassword: (email: string) => resetPassword(email)
  };
};
