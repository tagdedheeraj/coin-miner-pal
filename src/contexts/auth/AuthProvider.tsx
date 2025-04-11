
import React, { createContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthStateProvider } from './AuthStateContext';
import { useAuthData } from './useAuthData';
import { User, ArbitragePlan, WithdrawalRequest, DepositRequest } from '@/types/auth';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import { mockDepositRequests } from '@/data/mockDepositRequests';
import { mockUsers } from '@/data/mockUsers';
import { useToast } from "@/hooks/use-toast";
import { FullAuthContextType } from './customTypes';
import { authFunctions } from '@/services/authService';
import { adminServiceFunctions } from '@/services/auth/adminService';

export const AuthContext = createContext<FullAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthData();
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>(mockArbitragePlans);
  const { toast } = useToast();

  // Get all auth functions from the service
  const auth = authFunctions(user, setUser, setIsLoading);
  
  // Get admin functions
  const adminFunctions = adminServiceFunctions(user);

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

  // Combine auth service functions with local state functions and admin functions
  const contextValue: FullAuthContextType = {
    ...auth,
    ...adminFunctions,
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
