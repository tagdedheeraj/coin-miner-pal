
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagement from '@/components/admin/UserManagement';
import ArbitragePlanManagement from '@/components/admin/ArbitragePlanManagement';
import AdminTabsList from '@/components/admin/AdminTabsList';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if the user is an admin
  const isAdmin = user?.role === 'admin';
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <AdminTabsList />
      
      <div className="mt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/users" replace />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/plans" element={<ArbitragePlanManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
