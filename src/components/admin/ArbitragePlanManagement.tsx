
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ArbitragePlan } from '@/types/arbitragePlans';
import PlansTable from './plans/PlansTable';
import { 
  fetchArbitragePlans,
  updateArbitragePlan,
  createArbitragePlan,
  deleteArbitragePlan,
  subscribeToPlanChanges
} from '@/services/arbitragePlans';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import PlanFilterControls from './plans/PlanFilterControls';
import PlanActionButtons from './plans/PlanActionButtons';
import DeletePlanDialog from './plans/DeletePlanDialog';
import PlanErrorDisplay from './plans/PlanErrorDisplay';

const ArbitragePlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<ArbitragePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<ArbitragePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  
  // Filter plans based on search term and active filter
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = !showOnlyActive || (plan.totalEarnings > 0);
    return matchesSearch && isActive;
  });
  
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchArbitragePlans(true); // Force fresh data
        console.log("Fetched plans:", data);
        setPlans(data);
      } catch (error) {
        console.error("Error loading plans:", error);
        setError("योजनाओं को लोड करने में त्रुटि हुई");
        toast.error("योजनाओं को लोड करने में त्रुटि हुई");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
    
    // Set up a subscription to listen for changes
    const planSubscription = subscribeToPlanChanges(() => {
      console.log("Plan changes detected, refreshing...");
      loadPlans();
    });
      
    return () => {
      console.log("Unsubscribing from plan changes");
      planSubscription.unsubscribe();
    };
  }, []);
  
  const handleEditPlan = (plan: ArbitragePlan) => {
    console.log("Editing plan:", plan);
    setEditingPlan({...plan});
  };
  
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    setLoading(true);
    console.log("Saving plan changes:", editingPlan);
    
    const success = await updateArbitragePlan(editingPlan);
    
    if (success) {
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      setEditingPlan(null);
      
      // Refresh plans from server to ensure we have the latest data
      const updatedPlans = await fetchArbitragePlans(true);
      setPlans(updatedPlans);
    }
    
    setLoading(false);
  };
  
  // Initialize plan deletion confirmation
  const handleConfirmDelete = (planId: string) => {
    console.log("Opening delete confirmation for plan:", planId);
    setPlanToDelete(planId);
  };
  
  // Execute plan deletion after confirmation
  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    setLoading(true);
    console.log("Deleting plan:", planToDelete);
    
    const success = await deleteArbitragePlan(planToDelete);
    
    if (success) {
      // Remove from local state
      setPlans(plans.filter(plan => plan.id !== planToDelete));
      toast.success("योजना सफलतापूर्वक हटा दी गई");
    }
    
    // Reset planToDelete
    setPlanToDelete(null);
    setLoading(false);
  };
  
  const handleCancelEdit = () => {
    console.log("Cancelling edit");
    setEditingPlan(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    const { name, value, type } = e.target;
    console.log(`Changing ${name} to ${value} (${type})`);
    
    setEditingPlan({
      ...editingPlan,
      [name]: name === 'name' ? value : 
              name === 'limited' ? value === 'true' :
              name === 'limitedTo' && value === '' ? undefined :
              parseFloat(value) || 0
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    console.log(`Changing limited to ${e.target.checked}`);
    setEditingPlan({
      ...editingPlan,
      limited: e.target.checked
    });
  };

  const handleCreateNewPlan = async () => {
    setLoading(true);
    console.log("Creating new plan");
    
    const success = await createArbitragePlan();
    
    if (success) {
      // Refresh the plans list
      const data = await fetchArbitragePlans(true);
      console.log("Plans after creating new one:", data);
      setPlans(data);
    }
    
    setLoading(false);
  };
  
  const handleRefreshPlans = async () => {
    setLoading(true);
    setError(null);
    console.log("Manually refreshing plans");
    
    try {
      const freshPlans = await fetchArbitragePlans(true);
      console.log("Refreshed plans:", freshPlans);
      setPlans(freshPlans);
      toast.success("योजनाएं रिफ्रेश की गईं");
    } catch (error) {
      console.error("Error refreshing plans:", error);
      setError("योजनाओं को रिफ्रेश करने में त्रुटि हुई");
      toast.error("योजनाओं को रिफ्रेश करने में त्रुटि हुई");
    } finally {
      setLoading(false);
    }
  };

  const handleActiveFilterChange = (checked: boolean) => {
    console.log("Changing active filter to:", checked);
    setShowOnlyActive(checked);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Arbitrage Plan Management</CardTitle>
        <CardDescription>Manage all arbitrage plans in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <PlanFilterControls 
            searchTerm={searchTerm}
            showOnlyActive={showOnlyActive}
            onSearchChange={setSearchTerm}
            onActiveFilterChange={handleActiveFilterChange}
          />
          <PlanActionButtons 
            onRefresh={handleRefreshPlans}
            onCreate={handleCreateNewPlan}
            loading={loading}
          />
        </div>
        
        <PlanErrorDisplay error={error} />
        
        <PlansTable
          plans={plans}
          filteredPlans={filteredPlans}
          editingPlan={editingPlan}
          loading={loading}
          onEditPlan={handleEditPlan}
          onDeletePlan={handleConfirmDelete}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onSavePlan={handleSavePlan}
          onCancelEdit={handleCancelEdit}
        />

        <DeletePlanDialog 
          planToDelete={planToDelete}
          onClose={() => setPlanToDelete(null)}
          onConfirm={handleDeletePlan}
        />
      </CardContent>
    </Card>
  );
};

export default ArbitragePlanManagement;
