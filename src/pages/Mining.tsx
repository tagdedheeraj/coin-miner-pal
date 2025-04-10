
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MiningLayout from '@/components/mining/MiningLayout';
import MiningHeader from '@/components/mining/MiningHeader';
import MiningCard from '@/components/mining/MiningCard';

const Mining: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <MiningLayout>
      <MiningHeader />
      <MiningCard />
    </MiningLayout>
  );
};

export default Mining;
