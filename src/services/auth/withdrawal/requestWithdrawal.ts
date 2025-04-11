
import { User } from '@/types/auth';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export const createWithdrawalRequestFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const db = getFirestore();
  
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to request a withdrawal');
      return;
    }
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    if (amount <= 0) {
      toast.error('Withdrawal amount must be positive');
      return;
    }
    
    if (amount < 50) {
      toast.error('Minimum withdrawal amount is $50 USDT');
      return;
    }
    
    const currentBalance = user.usdtEarnings || 0;
    
    if (amount > currentBalance) {
      toast.error(`Insufficient balance. Available: $${currentBalance.toFixed(2)} USDT`);
      return;
    }
    
    try {
      // Add withdrawal request to the database
      await addDoc(collection(db, 'withdrawal_requests'), {
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        amount: amount,
        address: user.withdrawalAddress,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      
      // Add notification for the user
      const userRef = doc(db, 'users', user.id);
      const userNotifications = user.notifications || [];
      
      await updateDoc(userRef, {
        notifications: [
          ...userNotifications,
          {
            id: uuidv4(),
            message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is pending approval.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      // Update local user state with the new notification
      if (setUser) {
        setUser({
          ...user,
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is pending approval.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    }
  };
  
  return { requestWithdrawal };
};
