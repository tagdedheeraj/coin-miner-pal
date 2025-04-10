
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { generateReferralCode } from '@/utils/referral';

// Convert Firebase user to app User
export const mapFirebaseToUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser) return null;
  
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      // User exists in Firestore, return the data
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        name: userData.name || firebaseUser.displayName || 'User',
        email: userData.email || firebaseUser.email || '',
        coins: userData.coins || 0,
        referralCode: userData.referral_code || generateReferralCode(),
        hasSetupPin: userData.has_setup_pin || false,
        hasBiometrics: userData.has_biometrics || false,
        withdrawalAddress: userData.withdrawal_address || null,
        appliedReferralCode: userData.applied_referral_code || null,
        usdtEarnings: userData.usdt_earnings || 0,
        notifications: userData.notifications || [],
        isAdmin: userData.is_admin || false
      };
    }
    
    // User does not exist in Firestore, create a new profile
    const newUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      coins: 200, // Default starting coins
      referralCode: generateReferralCode(),
      hasSetupPin: false,
      hasBiometrics: false,
      withdrawalAddress: null,
      appliedReferralCode: null,
      usdtEarnings: 0,
      notifications: [],
      isAdmin: false
    };
    
    // Save to Firestore
    await saveUserToFirestore(newUser);
    
    return newUser;
  } catch (error) {
    console.error('Error mapping Firebase user:', error);
    return null;
  }
};

// Create or update user in Firestore
export const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userData = {
      name: user.name,
      email: user.email,
      coins: user.coins,
      referral_code: user.referralCode,
      has_setup_pin: user.hasSetupPin,
      has_biometrics: user.hasBiometrics,
      withdrawal_address: user.withdrawalAddress,
      applied_referral_code: user.appliedReferralCode,
      usdt_earnings: user.usdtEarnings,
      notifications: user.notifications,
      is_admin: user.isAdmin,
      updated_at: new Date().toISOString()
    };

    // Check if user exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, userData);
    } else {
      // Create new user with created_at timestamp
      await setDoc(userRef, {
        ...userData,
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw new Error('Failed to save user data');
  }
};
