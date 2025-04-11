
import { User } from '@/types/auth';
import { updateUserCoinsFn } from './updateUserCoins';

export const updateCoinsFunctions = (user: User | null) => {
  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    await updateUserCoinsFn(user, email, amount);
  };

  return { updateUserCoins };
};
