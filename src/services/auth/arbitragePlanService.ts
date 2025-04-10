
import { ArbitragePlan } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const arbitragePlanServiceFunctions = (
  arbitragePlans: ArbitragePlan[],
  setArbitragePlans: Dispatch<SetStateAction<ArbitragePlan[]>>
) => {
  const updateArbitragePlan = async (planId: string, updates: Partial<ArbitragePlan>): Promise<void> => {
    try {
      const updatedPlans = arbitragePlans.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      );
      
      setArbitragePlans(updatedPlans);
      toast.success('Arbitrage plan updated successfully');
    } catch (error) {
      console.error('Error updating arbitrage plan:', error);
      toast.error('Failed to update arbitrage plan');
    }
  };
  
  const deleteArbitragePlan = async (planId: string): Promise<void> => {
    try {
      const filteredPlans = arbitragePlans.filter(plan => plan.id !== planId);
      
      setArbitragePlans(filteredPlans);
      toast.success('Arbitrage plan deleted successfully');
    } catch (error) {
      console.error('Error deleting arbitrage plan:', error);
      toast.error('Failed to delete arbitrage plan');
    }
  };
  
  const addArbitragePlan = async (plan: Omit<ArbitragePlan, 'id'>): Promise<void> => {
    try {
      const newPlan: ArbitragePlan = {
        id: uuidv4(),
        ...plan
      };
      
      setArbitragePlans([...arbitragePlans, newPlan]);
      toast.success('Arbitrage plan added successfully');
    } catch (error) {
      console.error('Error adding arbitrage plan:', error);
      toast.error('Failed to add arbitrage plan');
    }
  };

  return {
    updateArbitragePlan,
    deleteArbitragePlan,
    addArbitragePlan
  };
};
