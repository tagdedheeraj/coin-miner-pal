
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { generateReferralCode } from '@/utils/referral';
import { SupabaseUserCredential } from '@/contexts/auth/types';

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
        
        // Store admin user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        setUser(adminUser);
        toast.success('Signed in as Admin');
        return;
      }
      
      console.log('Attempting to sign in with Supabase');
      // Regular user login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          const newUser: User = {
            id: data.user.id,
            name: email.split('@')[0],
            email: email,
            coins: 0,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
          };
          
          // Create profile in Supabase
          await supabase.from('users').insert([newUser]);
          
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        } else {
          throw profileError;
        }
      } else {
        // Use existing profile
        const userData: User = profileData;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<SupabaseUserCredential> => {
    setIsLoading(true);
    console.log('Attempting to sign up with Supabase');
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Failed to create user');
      }
      
      // Generate referral code
      const referralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: data.user.id,
        name,
        email,
        coins: 200, // Sign-up bonus
        referralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        usdtEarnings: 0,
        notifications: []
      };
      
      // Store in Supabase
      console.log('Creating user profile in Supabase');
      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (insertError) {
        console.error('User profile creation error:', insertError);
        throw insertError;
      }
      
      // Save in local state
      setUser(newUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      
      // Return the data in the expected format
      return data as SupabaseUserCredential;
    } catch (error) {
      console.error('Signup process error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Only sign out from Supabase if not admin
      if (user && !user.isAdmin) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign out');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin password cannot be changed');
    
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) throw new Error('Current password is incorrect');
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Supabase if not admin user
      if (!user.isAdmin) {
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      // Update localStorage for persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user data');
    }
  };

  const setupPin = async (pin: string) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await updateUser({ hasSetupPin: true });
      toast.success('PIN set up successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to set up PIN');
      throw error;
    }
  };

  const toggleBiometrics = async () => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await updateUser({ hasBiometrics: !user.hasBiometrics });
      toast.success(user.hasBiometrics ? 'Biometrics disabled' : 'Biometrics enabled');
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle biometrics');
      throw error;
    }
  };

  const setWithdrawalAddress = async (address: string) => {
    if (!user) return;
    
    try {
      await updateUser({ withdrawalAddress: address });
      toast.success('Withdrawal address updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update withdrawal address');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  const applyReferralCode = async (code: string) => {
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
      const { data: referrerData, error: referrerError } = await supabase
        .from('users')
        .select('*')
        .eq('referralCode', code)
        .single();
      
      if (referrerError || !referrerData) {
        throw new Error('Invalid referral code');
      }
      
      // Update the referrer's coins and add notification
      const referrer = referrerData as User;
      const referrerNotifications = referrer.notifications || [];
      
      await supabase
        .from('users')
        .update({
          coins: (referrer.coins || 0) + 250,
          notifications: [
            ...referrerNotifications,
            {
              id: uuidv4(),
              message: `${user.name} used your referral code! You received 250 bonus coins.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', referrer.id);
      
      // Update current user with applied referral code
      await updateUser({ appliedReferralCode: code });
      
      toast.success('Referral code applied successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      throw error;
    }
  };

  const sendNotificationToAllUsers = async (message: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can send notifications');
      return;
    }
    
    try {
      // Create notification object
      const notification = {
        id: uuidv4(),
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Get all users from Supabase
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Update each user with the notification
      for (const userData of users) {
        const userNotifications = userData.notifications || [];
        
        await supabase
          .from('users')
          .update({
            notifications: [...userNotifications, notification]
          })
          .eq('id', userData.id);
      }
      
      // Update current admin user's state if they have notifications
      if (user && user.isAdmin) {
        const currentUserNotifications = [...(user.notifications || []), notification];
        setUser({
          ...user,
          notifications: currentUserNotifications
        });
      }
      
      toast.success('Notification sent to all users');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Update the notification in the current user's state
      const updatedNotifications = user.notifications?.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      // Update the user state
      setUser({
        ...user,
        notifications: updatedNotifications
      });
      
      // Skip Supabase update for admin users
      if (user.isAdmin) return;
      
      // Update in Supabase
      await supabase
        .from('users')
        .update({
          notifications: updatedNotifications
        })
        .eq('id', user.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark notification as read');
    }
  };

  const updateUserUsdtEarnings = async (email: string, amount: number) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      // Update USDT earnings and add notification
      await supabase
        .from('users')
        .update({
          usdtEarnings: amount,
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your USDT earnings have been updated from ${targetUser.usdtEarnings || 0} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      // Update coins and add notification
      await supabase
        .from('users')
        .update({
          coins: amount,
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your coin balance has been updated from ${targetUser.coins} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };

  const requestWithdrawal = async (amount: number) => {
    if (!user) throw new Error('Not authenticated');
    if (user.isAdmin) throw new Error('Admin cannot request withdrawals');
    
    if (!user.withdrawalAddress) {
      throw new Error('Please set a withdrawal address first');
    }
    
    try {
      // Calculate available USDT balance
      const availableBalance = user.usdtEarnings || 0;
      
      if (amount > availableBalance) {
        throw new Error('Insufficient balance');
      }
      
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is $50');
      }
      
      // Create withdrawal request in Supabase
      const withdrawalRequest = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount,
        address: user.withdrawalAddress,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('withdrawalRequests')
        .insert([withdrawalRequest])
        .select();
      
      if (error) throw error;
      
      // Create notification for user
      const notification = {
        id: uuidv4(),
        message: `Your withdrawal request for $${amount.toFixed(2)} USDT has been submitted and is awaiting approval.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user with notification
      const userNotifications = user.notifications || [];
      await updateUser({
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to request withdrawal');
      throw error;
    }
  };
  
  const getWithdrawalRequests = async () => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('withdrawalRequests')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawal requests');
      return [];
    }
  };
  
  const approveWithdrawalRequest = async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const { data: requestData, error: requestError } = await supabase
        .from('withdrawalRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Withdrawal request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('withdrawalRequests')
        .update({
          status: 'approved',
          updatedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      // Find the user and update their USDT earnings
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const currentEarnings = targetUser.usdtEarnings || 0;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update({
          usdtEarnings: currentEarnings - request.amount,
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been approved and processed.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success('Withdrawal request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal request');
    }
  };
  
  const rejectWithdrawalRequest = async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject withdrawal requests');
      return;
    }
    
    try {
      // Get the withdrawal request
      const { data: requestData, error: requestError } = await supabase
        .from('withdrawalRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Withdrawal request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('withdrawalRequests')
        .update({
          status: 'rejected',
          updatedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your withdrawal request for $${request.amount.toFixed(2)} USDT has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success('Withdrawal request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject withdrawal request');
    }
  };

  const requestPlanPurchase = async (depositData) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Create the deposit request
      const depositRequest = {
        ...depositData,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('depositRequests')
        .insert([depositRequest]);
      
      if (error) throw error;
      
      // Add notification to user
      const notification = {
        id: uuidv4(),
        message: `Your deposit for ${depositData.planName} of $${depositData.amount} is being reviewed.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user with notification
      const userNotifications = user.notifications || [];
      await updateUser({
        notifications: [...userNotifications, notification]
      });
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };
  
  const getDepositRequests = async () => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('depositRequests')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };
  
  const approveDepositRequest = async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const { data: requestData, error: requestError } = await supabase
        .from('depositRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Deposit request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('depositRequests')
        .update({
          status: 'approved',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve deposit request');
    }
  };
  
  const rejectDepositRequest = async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const { data: requestData, error: requestError } = await supabase
        .from('depositRequests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw new Error('Deposit request not found');
      
      const request = requestData;
      
      if (request.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await supabase
        .from('depositRequests')
        .update({
          status: 'rejected',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', requestId);
      
      // Find the user and send notification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.userEmail)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = userData as User;
      const userNotifications = targetUser.notifications || [];
      
      await supabase
        .from('users')
        .update({
          notifications: [
            ...userNotifications,
            {
              id: uuidv4(),
              message: `Your deposit for ${request.planName} has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', targetUser.id);
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject deposit request');
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    changePassword,
    updateUser,
    setupPin,
    toggleBiometrics,
    setWithdrawalAddress,
    deleteUser,
    applyReferralCode,
    sendNotificationToAllUsers,
    markNotificationAsRead,
    updateUserUsdtEarnings,
    updateUserCoins,
    requestWithdrawal,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    requestPlanPurchase,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  };
};
