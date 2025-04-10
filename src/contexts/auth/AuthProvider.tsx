
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';
import * as LocalStorageAuth from '@/services/localStorageAuth';

export const AuthContext = createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const { toast: uiToast } = useToast();

  // Initialize local storage and check for existing user on mount
  useEffect(() => {
    LocalStorageAuth.initializeLocalStorage();
    const storedUser = LocalStorageAuth.getCurrentUser();
    
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const user = await LocalStorageAuth.signIn(email, password);
      setUser(user);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    toast.error("Google sign-in is not available in this version. Please use email/password instead.");
    throw new Error("Google sign-in is not available in this version");
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const user = await LocalStorageAuth.signUp(name, email, password);
      setUser(user);
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Sign-up error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await LocalStorageAuth.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await LocalStorageAuth.updateUser(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user data');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // In a real app, you would verify the current password against a hash
      // For now, we'll use a simplified approach
      if (!user) throw new Error('Not authenticated');
      
      const users = LocalStorageAuth.getAllUsers();
      const userWithPassword = users.find(u => u.id === user.id);
      
      if (!userWithPassword || userWithPassword.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update user's password
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
    }
  };

  const setupPin = async (pin: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await updateUser({ hasSetupPin: true });
    toast.success('PIN set up successfully');
  };

  const toggleBiometrics = async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await updateUser({ hasBiometrics: !user.hasBiometrics });
    toast.success(user.hasBiometrics ? 'Biometrics disabled' : 'Biometrics enabled');
  };

  const setWithdrawalAddress = async (address: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await updateUser({ withdrawalAddress: address });
    toast.success('Withdrawal address updated');
  };

  const getAllUsers = async (): Promise<User[]> => {
    return LocalStorageAuth.getAllUsers();
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await LocalStorageAuth.deleteUser(userId);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  const applyReferralCode = async (code: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    const users = LocalStorageAuth.getAllUsers();
    const referrer = users.find(u => u.referralCode === code);
    
    if (!referrer) {
      toast.error('Invalid referral code');
      return;
    }
    
    if (referrer.id === user.id) {
      toast.error('You cannot use your own referral code');
      return;
    }
    
    if (user.appliedReferralCode) {
      toast.error('You have already used a referral code');
      return;
    }
    
    // Update referrer's coins
    const updatedUsers = users.map(u => {
      if (u.id === referrer.id) {
        return { ...u, coins: u.coins + 250 };
      }
      return u;
    });
    
    LocalStorageAuth.saveAllUsers(updatedUsers);
    
    // Update current user
    await updateUser({ 
      appliedReferralCode: code,
      coins: user.coins + 200
    });
    
    toast.success('Referral code applied successfully');
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    try {
      const users = LocalStorageAuth.getAllUsers();
      const userToUpdate = users.find(u => u.email === email);
      
      if (!userToUpdate) {
        toast.error('User not found');
        return;
      }
      
      const updatedUsers = users.map(u => {
        if (u.email === email) {
          return { ...u, usdtEarnings: amount };
        }
        return u;
      });
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      
      // If the updated user is the current user, update the state
      if (user && user.email === email) {
        setUser({ ...user, usdtEarnings: amount });
      }
      
      toast.success('USDT earnings updated successfully');
    } catch (error) {
      console.error('Update USDT earnings error:', error);
      toast.error('Failed to update USDT earnings');
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    try {
      const users = LocalStorageAuth.getAllUsers();
      const userToUpdate = users.find(u => u.email === email);
      
      if (!userToUpdate) {
        toast.error('User not found');
        return;
      }
      
      const updatedUsers = users.map(u => {
        if (u.email === email) {
          return { ...u, coins: amount };
        }
        return u;
      });
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      
      // If the updated user is the current user, update the state
      if (user && user.email === email) {
        setUser({ ...user, coins: amount });
      }
      
      toast.success('Coins updated successfully');
    } catch (error) {
      console.error('Update coins error:', error);
      toast.error('Failed to update coins');
    }
  };

  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    setArbitragePlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
  };
  
  const deleteArbitragePlan = async (planId: string): Promise<void> => {
    setArbitragePlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };
  
  const addArbitragePlan = async (plan: Omit<ArbitragePlan, 'id'>): Promise<void> => {
    const newPlan: ArbitragePlan = {
      id: uuidv4(),
      ...plan,
    };
    setArbitragePlans(prevPlans => [...prevPlans, newPlan]);
  };

  const sendNotificationToAllUsers = async (message: string): Promise<void> => {
    try {
      const users = LocalStorageAuth.getAllUsers();
      
      const notificationId = uuidv4();
      const notification = {
        id: notificationId,
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      const updatedUsers = users.map(u => {
        const notifications = u.notifications || [];
        return {
          ...u,
          notifications: [...notifications, notification]
        };
      });
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      
      // Update current user if logged in
      if (user) {
        const currentNotifications = user.notifications || [];
        setUser({
          ...user,
          notifications: [...currentNotifications, notification]
        });
      }
      
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error('Send notification error:', error);
      toast.error('Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!user) return;
    
    try {
      const notifications = user.notifications || [];
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await updateUser({ notifications: updatedNotifications });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Local storage for withdrawal requests
  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    const withdrawalRequestsJson = localStorage.getItem('withdrawalRequests');
    return withdrawalRequestsJson ? JSON.parse(withdrawalRequestsJson) : [];
  };

  const saveWithdrawalRequests = async (requests: WithdrawalRequest[]): Promise<void> => {
    localStorage.setItem('withdrawalRequests', JSON.stringify(requests));
  };

  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    if (!user.withdrawalAddress) {
      toast.error('Please set a withdrawal address first');
      return;
    }
    
    if (user.usdtEarnings && amount > user.usdtEarnings) {
      toast.error('Insufficient USDT balance');
      return;
    }
    
    const withdrawalRequests = await getWithdrawalRequests();
    
    const newWithdrawal: WithdrawalRequest = {
      id: uuidv4(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount,
      address: user.withdrawalAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await saveWithdrawalRequests([...withdrawalRequests, newWithdrawal]);
    
    // Update user's USDT balance
    await updateUser({ 
      usdtEarnings: (user.usdtEarnings || 0) - amount 
    });
    
    toast.success('Withdrawal requested successfully');
  };

  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    const withdrawalRequests = await getWithdrawalRequests();
    
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' as const, updatedAt: new Date().toISOString() }
        : req
    );
    
    await saveWithdrawalRequests(updatedRequests);
    toast.success('Withdrawal approved');
  };

  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    const withdrawalRequests = await getWithdrawalRequests();
    
    const requestToReject = withdrawalRequests.find(req => req.id === requestId);
    if (!requestToReject) {
      toast.error('Withdrawal request not found');
      return;
    }
    
    // Refund the user
    const users = LocalStorageAuth.getAllUsers();
    const requestUser = users.find(u => u.id === requestToReject.userId);
    
    if (requestUser) {
      const updatedUsers = users.map(u => {
        if (u.id === requestUser.id) {
          return {
            ...u,
            usdtEarnings: (u.usdtEarnings || 0) + requestToReject.amount
          };
        }
        return u;
      });
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      
      // Update current user if it's the rejected request's user
      if (user && user.id === requestToReject.userId) {
        setUser({
          ...user,
          usdtEarnings: (user.usdtEarnings || 0) + requestToReject.amount
        });
      }
    }
    
    // Update the request status
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected' as const, updatedAt: new Date().toISOString() }
        : req
    );
    
    await saveWithdrawalRequests(updatedRequests);
    toast.success('Withdrawal rejected and funds returned');
  };

  // Local storage for deposit requests
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    const depositRequestsJson = localStorage.getItem('depositRequests');
    return depositRequestsJson ? JSON.parse(depositRequestsJson) : [];
  };

  const saveDepositRequests = async (requests: DepositRequest[]): Promise<void> => {
    localStorage.setItem('depositRequests', JSON.stringify(requests));
  };

  const getUserDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user) return [];
    
    const depositRequests = await getDepositRequests();
    return depositRequests.filter(req => req.userId === user.id);
  };

  const requestPlanPurchase = async (depositRequest: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    const depositRequests = await getDepositRequests();
    
    const newDeposit: DepositRequest = {
      id: uuidv4(),
      ...depositRequest,
      status: 'pending',
    };
    
    await saveDepositRequests([...depositRequests, newDeposit]);
    toast.success('Plan purchase requested successfully');
  };

  const approveDepositRequest = async (requestId: string): Promise<void> => {
    const depositRequests = await getDepositRequests();
    
    const requestToApprove = depositRequests.find(req => req.id === requestId);
    if (!requestToApprove) {
      toast.error('Deposit request not found');
      return;
    }
    
    // Add coins to user's balance
    const users = LocalStorageAuth.getAllUsers();
    const requestUser = users.find(u => u.id === requestToApprove.userId);
    
    if (requestUser) {
      const updatedUsers = users.map(u => {
        if (u.id === requestUser.id) {
          return {
            ...u,
            coins: u.coins + requestToApprove.amount
          };
        }
        return u;
      });
      
      LocalStorageAuth.saveAllUsers(updatedUsers);
      
      // Update current user if it's the approved request's user
      if (user && user.id === requestToApprove.userId) {
        setUser({
          ...user,
          coins: user.coins + requestToApprove.amount
        });
      }
    }
    
    // Update the request status
    const updatedRequests = depositRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' as const, reviewedAt: new Date().toISOString() }
        : req
    );
    
    await saveDepositRequests(updatedRequests);
    toast.success('Deposit approved and coins added');
  };

  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    const depositRequests = await getDepositRequests();
    
    const updatedRequests = depositRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
        : req
    );
    
    await saveDepositRequests(updatedRequests);
    toast.success('Deposit rejected');
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    // In this simplified version, we'll just show a toast
    toast.success('Verification email resent. Please check your inbox.');
  };

  const resetPassword = async (email: string): Promise<void> => {
    // In this simplified version, we'll just show a toast
    toast.success('Password reset instructions have been sent to your email.');
  };

  const contextValue = {
    // Core auth state
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    
    // Authentication
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
    resendVerificationEmail,
    resetPassword,
    
    // User Management
    updateUser,
    updateUserProfile: updateUser,
    setupPin,
    setupBiometrics: async (enabled: boolean) => {
      if (user) {
        await updateUser({ hasBiometrics: enabled });
      }
    },
    toggleBiometrics,
    changePassword,
    getAllUsers,
    
    // Referral Management
    applyReferralCode,
    
    // Notification Management
    sendNotificationToAllUsers,
    markNotificationAsRead,
    
    // Admin Functions
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUser,
    
    // Withdrawal Management
    updateWithdrawalAddress: setWithdrawalAddress,
    setWithdrawalAddress,
    getWithdrawalRequests,
    requestWithdrawal,
    approveWithdrawalRequest,
    approveWithdrawal: approveWithdrawalRequest,
    rejectWithdrawalRequest,
    rejectWithdrawal: rejectWithdrawalRequest,
    
    // Deposit Management
    getDepositRequests,
    getUserDepositRequests,
    requestDeposit: async (amount: number, transactionId: string) => {
      toast.success('Deposit request submitted for review.');
    },
    requestPlanPurchase,
    approveDepositRequest,
    approveDeposit: approveDepositRequest,
    rejectDepositRequest,
    rejectDeposit: rejectDepositRequest,
    
    // Arbitrage Plan Management
    updateArbitragePlan,
    deleteArbitragePlan,
    addArbitragePlan
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
