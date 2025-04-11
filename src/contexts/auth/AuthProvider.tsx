
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
import { adminServiceFunctions } from '@/services/auth/admin'; // Updated import path
import { auth } from '@/integrations/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { fetchArbitragePlans, updateArbitragePlan as updateArbPlan } from '@/services/arbitragePlanService';

export const AuthContext = createContext<FullAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthData();
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>([]);
  const { toast: uiToast } = useToast();

  // Get all auth functions from the service
  const authFns = authFunctions(user, setUser, setIsLoading);
  
  // Get admin functions
  const adminFunctions = adminServiceFunctions(user);

  // Fetch arbitrage plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await fetchArbitragePlans(true);
        setArbitragePlans(plans);
      } catch (error) {
        console.error("Error loading arbitrage plans:", error);
      }
    };
    
    loadPlans();
  }, []);

  // Listen to auth state changes in Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.uid);
      // You can handle auth state changes here if needed
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Custom implementations for functions that need the local state
  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    try {
      console.log("Updating plan with ID:", planId, "Updates:", updates);
      
      // Find current plan
      const currentPlan = arbitragePlans.find(p => p.id === planId);
      if (!currentPlan) {
        throw new Error("Plan not found");
      }
      
      // Create updated plan
      const updatedPlan: ArbitragePlan = {
        ...currentPlan,
        ...updates
      };
      
      // Update in service
      const success = await updateArbPlan(updatedPlan);
      
      if (success) {
        // Update local state only if the service update was successful
        setArbitragePlans(prevPlans =>
          prevPlans.map(plan =>
            plan.id === planId ? updatedPlan : plan
          )
        );
        
        toast.success('योजना सफलतापूर्वक अपडेट की गई');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('योजना अपडेट करने में विफल');
    }
  };
  
  const deleteArbitragePlan = async (planId: string): Promise<void> => {
    try {
      console.log("Deleting plan with ID:", planId);
      
      // Update local state
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
      console.log("Adding new plan with generated ID:", newPlanId);
      
      // Create new plan
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
    ...authFns,
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
