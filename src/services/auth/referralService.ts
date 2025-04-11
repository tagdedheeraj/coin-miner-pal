
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

export const referralServiceFunctions = (
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>
) => {
  const db = getFirestore();
  
  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
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
      const referrerQuery = query(usersRef, where('referral_code', '==', code));
      const referrerSnapshot = await getDocs(referrerQuery);
      
      if (referrerSnapshot.empty) {
        throw new Error('Invalid referral code');
      }
      
      // Get the referrer document and data
      const referrerDoc = referrerSnapshot.docs[0];
      const referrerData = referrerDoc.data();
      const referrerNotifications = referrerData.notifications || [];
      const currentCoins = referrerData.coins || 0;
      
      console.log('Found referrer:', referrerDoc.id, 'Current coins:', currentCoins);
      
      // Update the referrer with bonus coins
      await updateDoc(doc(db, 'users', referrerDoc.id), {
        coins: currentCoins + 250,
        notifications: [
          ...referrerNotifications,
          {
            id: uuidv4(),
            message: `${user.name} used your referral code! You received 250 bonus coins.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      });
      
      console.log('Updated referrer coins to:', currentCoins + 250);
      
      // Update current user with applied referral code
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { 
        applied_referral_code: code 
      });
      
      // Update user state
      setUser({
        ...user,
        appliedReferralCode: code
      });
      
      toast.success('Referral code applied successfully! The referrer received 250 bonus coins.');
    } catch (error) {
      console.error('Referral error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      throw error;
    }
  };
  
  return {
    applyReferralCode
  };
};
