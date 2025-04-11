
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { mockUsers } from '@/data/mockUsers';

export const getAllUsersFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  const usersCollectionRef = collection(db, 'users');
  
  const getAllUsers = async (): Promise<User[]> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can access user list');
      return [];
    }

    try {
      console.log('Fetching all users from Firebase...');
      
      // Get users from Firebase
      const usersSnapshot = await getDocs(usersCollectionRef);
      const users: User[] = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          coins: data.coins || 0,
          referralCode: data.referralCode || '',
          hasSetupPin: data.hasSetupPin || false,
          hasBiometrics: data.hasBiometrics || false,
          withdrawalAddress: data.withdrawalAddress || null,
          appliedReferralCode: data.appliedReferralCode || undefined,
          usdtEarnings: data.usdtEarnings || 0,
          notifications: data.notifications || [],
          isAdmin: data.isAdmin || false
        };
      });
      
      // If no users found in Firebase, use mock data (for development)
      if (users.length === 0) {
        console.log('No users found in Firebase, using mock data');
        return mockUsers.map(mockUser => ({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          coins: mockUser.coins,
          referralCode: mockUser.referralCode,
          hasSetupPin: mockUser.hasSetupPin,
          hasBiometrics: mockUser.hasBiometrics,
          withdrawalAddress: mockUser.withdrawalAddress,
          appliedReferralCode: mockUser.appliedReferralCode,
          usdtEarnings: mockUser.usdtEarnings || 0,
          notifications: mockUser.notifications || [],
          isAdmin: mockUser.isAdmin || false
        }));
      }
      
      console.log('Found users:', users.length);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      
      // Return mock users as fallback
      return mockUsers.map(mockUser => ({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        coins: mockUser.coins,
        referralCode: mockUser.referralCode,
        hasSetupPin: mockUser.hasSetupPin,
        hasBiometrics: mockUser.hasBiometrics,
        withdrawalAddress: mockUser.withdrawalAddress,
        appliedReferralCode: mockUser.appliedReferralCode,
        usdtEarnings: mockUser.usdtEarnings || 0,
        notifications: mockUser.notifications || [],
        isAdmin: mockUser.isAdmin || false
      }));
    }
  };

  return { getAllUsers };
};
