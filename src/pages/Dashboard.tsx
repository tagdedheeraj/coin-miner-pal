
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BalanceCard from '@/components/dashboard/BalanceCard';
import DashboardItems from '@/components/dashboard/DashboardItems';
import QuickAccessSection from '@/components/dashboard/QuickAccessSection';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <DashboardLayout>
      <DashboardHeader user={user} />
      <BalanceCard user={user} />
      <DashboardItems user={user} />
      <QuickAccessSection />
    </DashboardLayout>
  );
};

export default Dashboard;
