
import React, { createContext, useState, ReactNode, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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

  // Listen to auth state changes in Supabase
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event, session?.user?.id);
      // You can handle auth state changes here if needed
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Custom implementations for functions that need the local state
  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    setArbitragePlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
  };
  
  const deleteArbitragePlan = async (planId: string): Promise<void> => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('arbitrage_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      // If successful, update local state
      setArbitragePlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      toast.success('योजना सफलतापूर्वक हटा दी गई');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('योजना हटाने में विफल');
    }
  };
  
  const addArbitragePlan = async (plan: Omit<ArbitragePlan, 'id'>): Promise<void> => {
    try {
      // Generate ID
      const newPlanId = uuidv4();
      
      // Convert to DB format
      const dbPlan = {
        id: newPlanId,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        daily_earnings: plan.dailyEarnings,
        mining_speed: plan.miningSpeed,
        total_earnings: plan.totalEarnings,
        withdrawal: plan.withdrawal,
        color: plan.color,
        limited: plan.limited,
        limited_to: plan.limitedTo
      };
      
      // Insert to Supabase
      const { error } = await supabase
        .from('arbitrage_plans')
        .insert(dbPlan);
        
      if (error) throw error;
      
      // If successful, update local state
      const newPlan: ArbitragePlan = {
        id: newPlanId,
        ...plan,
      };
      setArbitragePlans(prevPlans => [...prevPlans, newPlan]);
      toast.success('नई योजना जोड़ी गई');
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('योजना जोड़ने में विफल');
    }
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
