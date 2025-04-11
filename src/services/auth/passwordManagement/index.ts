
import { User } from '@/types/auth';
import { changePassword } from './changePassword';

export const createPasswordService = (user: User | null) => {
  return {
    changePassword: (currentPassword: string, newPassword: string) => 
      changePassword(user, currentPassword, newPassword)
  };
};
