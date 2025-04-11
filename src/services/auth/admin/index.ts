
import { User } from '@/types/auth';
import { getAllUsersFunctions } from './getAllUsers';
import { updateUsdtEarningsFunctions } from './updateUsdtEarnings';
import { updateCoinsFunctions } from './updateCoins';
import { deleteUserFunctions } from './deleteUser';

export const adminServiceFunctions = (user: User | null) => {
  // Get individual function groups
  const { getAllUsers } = getAllUsersFunctions(user);
  const { updateUserUsdtEarnings } = updateUsdtEarningsFunctions(user);
  const { updateUserCoins } = updateCoinsFunctions(user);
  const { deleteUser } = deleteUserFunctions(user);
  
  // Combine all admin functions into one object and return
  return {
    getAllUsers,
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUser
  };
};
