import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  useCallback 
} from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { MockUser, User, AuthContextType, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { useToast } from "@/components/ui/use-toast"

// Adding new imports for the deposit functionality
import { v4 as uuidv4 } from 'uuid';
import { mockDepositRequests } from '@/data/mockDepositRequests';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(mockDepositRequests);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const mockUser = mockUsers.find(u => u.email === firebaseUser.email);
        if (mockUser) {
          setUser({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            coins: mockUser.coins,
            referralCode: mockUser.referralCode,
            hasSetupPin: mockUser.hasSetupPin,
            hasBiometrics: mockUser.hasBiometrics,
            withdrawalAddress: mockUser.withdrawalAddress,
            appliedReferralCode: mockUser.appliedReferralCode,
            usdtEarnings: mockUser.usdtEarnings,
            notifications: mockUser.notifications,
            isAdmin: mockUser.isAdmin
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            coins: 0,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
            isAdmin: false
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      })
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const newUser: MockUser = {
        id: userCredential.user.uid,
        name: name,
        email: email,
        coins: 0,
        password: password,
        referralCode: generateReferralCode(),
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        isAdmin: false
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        coins: newUser.coins,
        referralCode: newUser.referralCode,
        hasSetupPin: newUser.hasSetupPin,
        hasBiometrics: newUser.hasBiometrics,
        withdrawalAddress: newUser.withdrawalAddress,
        isAdmin: newUser.isAdmin
      });
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      })
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      })
      console.error("Sign out failed:", error.message);
    }
  };

  const updateUser = (updates: Partial<User>): void => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }

    try {
      // Re-authenticate the user
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await auth.currentUser?.reauthenticateWithCredential(credential);

      // Update the password
      await updatePassword(auth.currentUser, newPassword);
      console.log("Password updated successfully!");
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      })
      throw error;
    }
  };

  const setupPin = async (pin: string): Promise<void> => {
    // Mock implementation
    console.log("Setting up PIN:", pin);
    updateUser({ hasSetupPin: true });
  };

  const toggleBiometrics = (): void => {
    // Mock implementation
    console.log("Toggling biometrics");
    updateUser({ hasBiometrics: !user?.hasBiometrics });
  };

  const setWithdrawalAddress = (address: string): void => {
    updateUser({ withdrawalAddress: address });
  };

  const applyReferralCode = async (code: string): Promise<void> => {
    // Mock implementation
    console.log("Applying referral code:", code);
    updateUser({ appliedReferralCode: code });
  };
  
  const deleteUser = (userId: string): void => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.email === email ? { ...u, usdtEarnings: amount } : u
      )
    );
    
    setUser(prevUser =>
      prevUser?.email === email ? { ...prevUser, usdtEarnings: amount } : prevUser || null
    );
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.email === email ? { ...u, coins: amount } : u
      )
    );
    
    setUser(prevUser =>
      prevUser?.email === email ? { ...prevUser, coins: amount } : prevUser || null
    );
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

  const sendNotificationToAllUsers = (message: string): void => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        const newNotification = {
          id: uuidv4(),
          message: message,
          read: false,
          createdAt: new Date().toISOString()
        };
        const updatedNotifications = u.notifications ? [...u.notifications, newNotification] : [newNotification];
        return { ...u, notifications: updatedNotifications };
      })
    );
  };

  const markNotificationAsRead = (notificationId: string): void => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.notifications) {
          const updatedNotifications = u.notifications.map(notification => {
            if (notification.id === notificationId) {
              return { ...notification, read: true };
            }
            return notification;
          });
          return { ...u, notifications: updatedNotifications };
        }
        return u;
      })
    );
  };
  
  const requestWithdrawal = async (amount: number): Promise<void> => {
    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }
    
    if (!user.withdrawalAddress) {
      toast({
        title: "No Withdrawal Address",
        description: "Please set your withdrawal address in your profile.",
        variant: "destructive",
      })
      return;
    }
    
    const newWithdrawalRequest: WithdrawalRequest = {
      id: uuidv4(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount: amount,
      address: user.withdrawalAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setWithdrawalRequests(prev => [...prev, newWithdrawalRequest]);
    
    toast({
      title: "Withdrawal Requested",
      description: `Your withdrawal request for $${amount} is being processed.`,
    })
  };
  
  const getWithdrawalRequests = useCallback(async (): Promise<WithdrawalRequest[]> => {
    console.log('Getting withdrawal requests');
    return withdrawalRequests;
  }, [withdrawalRequests]);
  
  const approveWithdrawalRequest = async (requestId: string): Promise<void> => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));
  };
  
  const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));
  };

  const getDepositRequests = useCallback(async (): Promise<DepositRequest[]> => {
    // In a real application, this would be an API call
    console.log('Getting deposit requests');
    return depositRequests;
  }, [depositRequests]);

  const requestPlanPurchase = useCallback(async (depositData: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>) => {
    console.log('Requesting plan purchase:', depositData);
    
    const newDeposit: DepositRequest = {
      id: `dep-${uuidv4()}`,
      ...depositData,
      status: 'pending'
    };
    
    setDepositRequests(prev => [...prev, newDeposit]);
    
    // Send notification to admins in a real app
    console.log('New deposit request submitted:', newDeposit);
    
    addNotification({
      title: "Deposit Submitted",
      description: `Your deposit for ${depositData.planName} of $${depositData.amount} is being reviewed.`,
    });
    
    return Promise.resolve();
  }, [addNotification]);

  const approveDepositRequest = useCallback(async (requestId: string) => {
    console.log('Approving deposit request:', requestId);
    
    setDepositRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          reviewedAt: new Date().toISOString()
        };
      }
      return req;
    }));
    
    // Find the deposit request
    const request = depositRequests.find(req => req.id === requestId);
    
    if (request) {
      // Find the user
      const userToUpdate = mockUsers.find(u => u.id === request.userId);
      
      if (userToUpdate) {
        // Update user's plan in a real app
        console.log(`User ${userToUpdate.email} now has ${request.planName} active`);
        
        // Send notification to user
        const notifications = userToUpdate.notifications || [];
        const newNotification = {
          id: uuidv4(),
          message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        const updatedNotifications = [...notifications, newNotification];
        
        const updatedUser = {
          ...userToUpdate,
          notifications: updatedNotifications
        };
        
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
    }
    
    return Promise.resolve();
  }, [depositRequests]);

  const rejectDepositRequest = useCallback(async (requestId: string) => {
    console.log('Rejecting deposit request:', requestId);
    
    setDepositRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          reviewedAt: new Date().toISOString()
        };
      }
      return req;
    }));
    
    // Find the deposit request
    const request = depositRequests.find(req => req.id === requestId);
    
    if (request) {
      // Find the user
      const userToUpdate = mockUsers.find(u => u.id === request.userId);
      
      if (userToUpdate) {
        // Send notification to user
        const notifications = userToUpdate.notifications || [];
        const newNotification = {
          id: uuidv4(),
          message: `Your deposit for ${request.planName} has been rejected. Please contact support for more information.`,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        const updatedNotifications = [...notifications, newNotification];
        
        const updatedUser = {
          ...userToUpdate,
          notifications: updatedNotifications
        };
        
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
    }
    
    return Promise.resolve();
  }, [depositRequests]);

  const addNotification = ({ title, description }: { title: string; description: string }) => {
    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === user.id) {
          const newNotification = {
            id: uuidv4(),
            message: `${title}: ${description}`,
            read: false,
            createdAt: new Date().toISOString()
          };
          const updatedNotifications = u.notifications ? [...u.notifications, newNotification] : [newNotification];
          return { ...u, notifications: updatedNotifications };
        }
        return u;
      })
    );
    
    toast({
      title: title,
      description: description,
    })
  };

  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  return (
    <AuthContext.Provider
      value={{
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
        deleteUser,
        updateUserUsdtEarnings,
        updateUserCoins,
        updateArbitragePlan,
        deleteArbitragePlan,
        addArbitragePlan,
        sendNotificationToAllUsers,
        markNotificationAsRead,
        requestWithdrawal,
        getWithdrawalRequests,
        approveWithdrawalRequest,
        rejectWithdrawalRequest,
        requestPlanPurchase,
        getDepositRequests,
        approveDepositRequest,
        rejectDepositRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
