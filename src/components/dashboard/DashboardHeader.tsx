
import React from 'react';
import { User } from '@/types/auth';

interface DashboardHeaderProps {
  user: User | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name.split(' ')[0]}</h1>
      <p className="text-gray-500">Your mining dashboard</p>
    </div>
  );
};

export default DashboardHeader;
