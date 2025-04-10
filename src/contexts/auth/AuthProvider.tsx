
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthStateProvider } from './AuthStateContext';
import { useAuthData } from './useAuthData';
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { mockDepositRequests } from '@/data/mockDepositRequests';
import { mockUsers } from '@/data/mockUsers';
import { useToast } from "@/hooks/use-toast";
import { FullAuthContextType } from './types';
import { authFunctions } from '@/services/authService';

export const AuthContext = createContext<FullAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthData();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(mockDepositRequests);
  const { toast } = useToast();

  // Define addNotification function
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

  // Get all auth functions from the service
  const auth = authFunctions(user, setUser, setIsLoading);

  // Custom implementations for functions that need the local state
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

  // Combine auth service functions with local state functions
  const contextValue: FullAuthContextType = {
    ...auth,
    user,
    isAuthenticated: !!user,
    isLoading,
    updateArbitragePlan,
    deleteArbitragePlan,
    addArbitragePlan,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrap component with both context providers
export const CombinedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AuthStateProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AuthStateProvider>
  );
};
