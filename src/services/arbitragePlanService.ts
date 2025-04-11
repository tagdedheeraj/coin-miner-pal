
import { supabase } from '@/integrations/supabase/client';
import { ArbitragePlan, ArbitragePlanDB } from '@/types/arbitragePlans';
import { toast } from 'sonner';

// Map the database columns to our frontend model
export const mapDbToPlan = (dbPlan: Record<string, any>): ArbitragePlan => {
  return {
    id: dbPlan.id,
    name: dbPlan.name,
    price: dbPlan.price,
    duration: dbPlan.duration,
    dailyEarnings: dbPlan.daily_earnings,
    miningSpeed: dbPlan.mining_speed,
    totalEarnings: dbPlan.total_earnings,
    withdrawal: dbPlan.withdrawal,
    color: dbPlan.color || 'blue',
    limited: dbPlan.limited || false,
    limitedTo: dbPlan.limited_to
  };
};

// Map the frontend model to database columns
export const mapPlanToDb = (plan: ArbitragePlan): ArbitragePlanDB => {
  return {
    id: plan.id,
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
};

export const fetchArbitragePlans = async (): Promise<ArbitragePlan[]> => {
  try {
    // Use rpc for custom SQL queries instead of the typed query builder
    const { data, error } = await supabase
      .rpc('get_arbitrage_plans')
      .select();
    
    // If rpc fails (likely because the function doesn't exist), fallback to raw query
    if (error) {
      console.warn('Falling back to direct table query:', error);
      // Use the PostgrestQueryBuilder directly with any type to bypass type checking
      const response = await (supabase as any)
        .from('arbitrage_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (response.error) {
        toast.error('Failed to fetch plans');
        console.error('Error fetching plans:', response.error);
        return [];
      }
      
      if (response.data) {
        return response.data.map((plan: any) => mapDbToPlan(plan));
      }
    } else if (data) {
      return data.map(plan => mapDbToPlan(plan));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

export const updateArbitragePlan = async (plan: ArbitragePlan): Promise<boolean> => {
  try {
    const dbPlan = mapPlanToDb(plan);
    
    // Use PostgrestQueryBuilder directly with any type to bypass type checking
    const { error } = await (supabase as any)
      .from('arbitrage_plans')
      .update(dbPlan)
      .eq('id', plan.id);
    
    if (error) {
      toast.error('Failed to update plan');
      console.error('Error updating plan:', error);
      return false;
    }
    
    toast.success('Plan updated successfully');
    return true;
  } catch (error) {
    console.error('Error saving plan:', error);
    toast.error('Failed to save plan changes');
    return false;
  }
};

export const createArbitragePlan = async (): Promise<boolean> => {
  // Create a new plan with default values
  const newPlan = {
    name: 'New Plan',
    price: 50,
    duration: 30,
    daily_earnings: 2,
    mining_speed: '1.5x',
    total_earnings: 60,
    withdrawal: 'Daily',
    color: 'blue',
    limited: false
  };
  
  try {
    // Use PostgrestQueryBuilder directly with any type to bypass type checking
    const { data, error } = await (supabase as any)
      .from('arbitrage_plans')
      .insert(newPlan)
      .select();
    
    if (error) {
      toast.error('Failed to create new plan');
      console.error('Error creating plan:', error);
      return false;
    }
    
    if (data && data[0]) {
      toast.success('New plan created');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error creating plan:', error);
    toast.error('Failed to create new plan');
    return false;
  }
};

export const subscribeToPlanChanges = (callback: () => void) => {
  return supabase
    .channel('arbitrage_plans_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'arbitrage_plans' 
    }, callback)
    .subscribe();
};
