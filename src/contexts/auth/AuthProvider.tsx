import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

export const AuthContext = createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const { toast: uiToast } = useToast();
  
  // Initialize Firebase auth and check for existing user on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const userObj: User = {
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
          isAdmin: false, // For now, no user is admin by default
        };
        setUser(userObj);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Helper function to generate a referral code
  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please sign up.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      toast.success('Account created successfully. Please check your email for verification.');
    } catch (error: any) {
      console.error('Sign-up error:', error);
      let errorMessage = 'Failed to sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user data');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!user || !auth.currentUser) throw new Error('Not authenticated');
      
      // Re-authenticate user before changing password (not implemented here)
      // Would require reauthenticateWithCredential
      
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent. Please check your inbox.');
      } else {
        toast.error('You need to be logged in to resend verification email.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to resend verification email');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send password reset email');
    }
  };

  // Handle withdrawal requests with local storage (simplified)
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
    
    // Update the request status
    const updatedRequests = withdrawalRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'rejected' as const, updatedAt: new Date().toISOString() }
        : req
    );
    
    await saveWithdrawalRequests(updatedRequests);
    toast.success('Withdrawal rejected');
  };

  // Handle deposit requests with local storage (simplified)
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
    
    // Update the request status
    const updatedRequests = depositRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved' as const, reviewedAt: new Date().toISOString() }
        : req
    );
    
    await saveDepositRequests(updatedRequests);
    toast.success('Deposit approved');
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

  // Other simplified methods
  const getAllUsers = async (): Promise<User[]> => {
    // For now, just return a mock array with the current user
    return user ? [user] : [];
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
    setupPin: async (pin: string) => {
      if (user) {
        await updateUser({ hasSetupPin: true });
      }
    },
    setupBiometrics: async (enabled: boolean) => {
      if (user) {
        await updateUser({ hasBiometrics: enabled });
      }
    },
    toggleBiometrics: async () => {
      if (user) {
        await updateUser({ hasBiometrics: !user.hasBiometrics });
      }
    },
    changePassword,
    getAllUsers,
    
    // Simplified admin functions
    updateUserUsdtEarnings: async (email: string, amount: number) => {
      toast.success('USDT earnings updated');
    },
    updateUserCoins: async (email: string, amount: number) => {
      toast.success('Coins updated');
    },
    deleteUser: async (userId: string) => {
      toast.success('User deleted');
    },
    
    // Withdrawal Management
    updateWithdrawalAddress: async (address: string) => {
      if (user) {
        await updateUser({ withdrawalAddress: address });
      }
    },
    setWithdrawalAddress: async (address: string) => {
      if (user) {
        await updateUser({ withdrawalAddress: address });
      }
    },
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
    
    // Other simplified methods
    applyReferralCode: async (code: string) => {
      toast.success('Referral code applied successfully');
    },
    sendNotificationToAllUsers: async (message: string) => {
      toast.success('Notification sent to all users');
    },
    markNotificationAsRead: async (notificationId: string) => {
      // No-op for now
    },
    
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
