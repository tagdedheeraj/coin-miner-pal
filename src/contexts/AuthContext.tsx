import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  referralCode: string;
  hasSetupPin: boolean;
  hasBiometrics: boolean;
  withdrawalAddress: string | null;
  appliedReferralCode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  toggleBiometrics: () => Promise<void>;
  setWithdrawalAddress: (address: string) => void;
  applyReferralCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development
const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    coins: 200, // Sign-up bonus
    referralCode: 'DEMO123',
    hasSetupPin: false,
    hasBiometrics: false,
    withdrawalAddress: null,
    appliedReferralCode: null,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
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
      mockUsers[referrerIndex].coins += 250;
    }
    
    // Update current user with applied referral code and bonus (250 coins)
    const currentUserIndex = mockUsers.findIndex(u => u.id === user.id);
    if (currentUserIndex !== -1) {
      mockUsers[currentUserIndex].appliedReferralCode = code;
      mockUsers[currentUserIndex].coins += 250;
    }
    
    // Update the current user state
    updateUser({ 
      coins: user.coins + 250, 
      appliedReferralCode: code 
    });
    
    toast.success('Referral code applied successfully! You received 250 bonus coins.');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    changePassword,
    setupPin,
    toggleBiometrics,
    setWithdrawalAddress,
    applyReferralCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
