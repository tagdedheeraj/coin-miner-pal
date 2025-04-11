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
import { 
  fetchArbitragePlans, 
  updateArbitragePlan as updateArbPlan,
  deleteArbitragePlan as deleteArbPlan,
  createArbitragePlan as createArbPlan
} from '@/services/arbitragePlans';
import { updateUserDailyEarnings } from '@/services/auth/earnings/updateDailyEarnings';

export const AuthContext = createContext<FullAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthData();
  const [arbitragePlans, setArbitragePlans] = useState<ArbitragePlan[]>([]);
  const { toast: uiToast } = useToast();

  const authFns = authFunctions(user, setUser, setIsLoading);
  
  const adminFunctions = adminServiceFunctions(user);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.uid);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      const updateUserEarnings = async () => {
        try {
          await updateUserDailyEarnings(user.id);
        } catch (error) {
          console.error('Error updating user earnings:', error);
        }
      };
      
      updateUserEarnings();
      
      const intervalId = setInterval(updateUserEarnings, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [user?.id]);

  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    try {
      console.log("Updating plan with ID:", planId, "Updates:", updates);
      
      const currentPlan = arbitragePlans.find(p => p.id === planId);
      if (!currentPlan) {
        throw new Error("Plan not found");
      }
      
      const updatedPlan: ArbitragePlan = {
        ...currentPlan,
        ...updates
      };
      
      const success = await updateArbPlan(updatedPlan);
      
      if (success) {
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
      
      const success = await deleteArbPlan(planId);
      
      if (success) {
        setArbitragePlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
        toast.success('योजना सफलतापूर्वक हटा दी गई');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('योजना हटाने में विफल');
    }
  };
  
  const addArbitragePlan = async (): Promise<void> => {
    try {
      console.log("Adding new plan");
      
      const success = await createArbPlan();
      
      if (success) {
        const freshPlans = await fetchArbitragePlans(true);
        setArbitragePlans(freshPlans);
        toast.success('नई योजना जोड़ी गई');
      }
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('योजना जोड़ने में विफल');
    }
  };

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

export const CombinedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AuthStateProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AuthStateProvider>
  );
};
