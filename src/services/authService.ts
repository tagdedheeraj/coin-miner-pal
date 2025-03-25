
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { toast } from 'sonner';

// Admin credentials
const ADMIN_EMAIL = 'admin@infinium.com';
const ADMIN_PASSWORD = 'Infinium@123';

export const authFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if this is an admin login
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create admin user object
        const adminUser = {
          id: 'admin-id',
          name: 'Admin',
          email: ADMIN_EMAIL,
          coins: 0,
          referralCode: '',
          hasSetupPin: true,
          hasBiometrics: false,
          withdrawalAddress: null,
          appliedReferralCode: null,
          notifications: [],
          isAdmin: true
        };
        
        setUser(adminUser);
        toast.success('Signed in as Admin');
        return;
      }
      
      // Regular user login
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      toast.success('Signed in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        coins: 200, // Sign-up bonus
        referralCode: 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        appliedReferralCode: null,
        notifications: [],
      };
      
      mockUsers.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    
    // In a real app, this would be an API call
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    
    if (userIndex === -1 || mockUsers[userIndex].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    mockUsers[userIndex].password = newPassword;
    toast.success('Password changed successfully');
  };

  const setupPin = async (pin: string) => {
    if (!user) throw new Error('Not authenticated');
    
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateUser({ hasSetupPin: true });
    toast.success('PIN set up successfully');
  };

  const toggleBiometrics = async () => {
    if (!user) throw new Error('Not authenticated');
    
    // In a real app, this would check device capability and prompt for biometric authentication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateUser({ hasBiometrics: !user.hasBiometrics });
    toast.success(user.hasBiometrics ? 'Biometrics disabled' : 'Biometrics enabled');
  };

  const setWithdrawalAddress = (address: string) => {
    if (!user) return;
    updateUser({ withdrawalAddress: address });
    toast.success('Withdrawal address updated');
  };

  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user has already applied a referral code
    if (user.appliedReferralCode) {
      throw new Error('You have already applied a referral code');
    }
    
    // Validate referral code
    if (code === user.referralCode) {
      throw new Error('You cannot use your own referral code');
    }
    
    // Find the user with the given referral code
    const referrerUser = mockUsers.find(u => u.referralCode === code);
    
    if (!referrerUser) {
      throw new Error('Invalid referral code');
    }
    
    // Add bonus to the referrer (250 coins)
    const referrerIndex = mockUsers.findIndex(u => u.id === referrerUser.id);
    if (referrerIndex !== -1) {
      // Add the referral bonus to the referrer (not the current user)
      mockUsers[referrerIndex].coins += 250;
      
      // Add notification to the referrer
      if (!mockUsers[referrerIndex].notifications) {
        mockUsers[referrerIndex].notifications = [];
      }
      
      mockUsers[referrerIndex].notifications.push({
        id: Date.now().toString(),
        message: `${user.name} used your referral code! You received 250 bonus coins.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
    
    // Update current user with applied referral code
    const currentUserIndex = mockUsers.findIndex(u => u.id === user.id);
    if (currentUserIndex !== -1) {
      mockUsers[currentUserIndex].appliedReferralCode = code;
      // We don't add coins to the current user anymore
    }
    
    // Update the current user state - only update the appliedReferralCode field
    updateUser({ 
      appliedReferralCode: code 
    });
    
    toast.success('Referral code applied successfully!');
  };

  const deleteUser = (userId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error('User not found');
      return;
    }
    
    mockUsers.splice(userIndex, 1);
    toast.success('User deleted successfully');
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const userIndex = mockUsers.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update USDT earnings
      const currentEarnings = mockUsers[userIndex].usdtEarnings || 0;
      mockUsers[userIndex].usdtEarnings = amount;
      
      // Add notification to the user
      if (!mockUsers[userIndex].notifications) {
        mockUsers[userIndex].notifications = [];
      }
      
      mockUsers[userIndex].notifications.push({
        id: Date.now().toString(),
        message: `Your USDT earnings have been updated from ${currentEarnings} to ${amount} by admin.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const userIndex = mockUsers.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update coins
      const currentCoins = mockUsers[userIndex].coins;
      mockUsers[userIndex].coins = amount;
      
      // Add notification to the user
      if (!mockUsers[userIndex].notifications) {
        mockUsers[userIndex].notifications = [];
      }
      
      mockUsers[userIndex].notifications.push({
        id: Date.now().toString(),
        message: `Your coin balance has been updated from ${currentCoins} to ${amount} by admin.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    updateUser,
    changePassword,
    setupPin,
    toggleBiometrics,
    setWithdrawalAddress,
    applyReferralCode,
    deleteUser,
    updateUserUsdtEarnings,
    updateUserCoins,
  };
};
