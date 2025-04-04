
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const referralServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  
  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot apply referral code');
    
    try {
      // Check if user has already applied a referral code
      if (user.appliedReferralCode) {
        throw new Error('You have already applied a referral code');
      }
      
      // Validate referral code
      if (code === user.referralCode) {
        throw new Error('You cannot use your own referral code');
      }
      
      // Find the user with the given referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid referral code');
      }
      
      // Get the first user doc (there should only be one)
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      const referrerData = referrerDoc.data() as User;
      
      // Update the referrer's coins and add notification
      const referrerRef = doc(db, 'users', referrerId);
      const referrerNotifications = referrerData.notifications || [];
      
      await updateDoc(referrerRef, {
        coins: (referrerData.coins || 0) + 250,
        notifications: [
          ...referrerNotifications,
          {
            id: Date.now().toString(),
            message: `${user.name} used your referral code! You received 250 bonus coins.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      // Update current user with applied referral code
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        appliedReferralCode: code
      });
      
      // Update user state
      setUser({
        ...user,
        appliedReferralCode: code
      });
      
      toast.success('Referral code applied successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      throw error;
    }
  };
  
  return {
    applyReferralCode
  };
};
