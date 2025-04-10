
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LayoutGrid, DollarSign, Coins, BellRing } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';

const AdminManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users and system settings</p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Arbitrage Plans
            </TabsTrigger>
            <TabsTrigger value="usdt" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> USDT Management
            </TabsTrigger>
            <TabsTrigger value="coins" className="flex items-center gap-2">
              <Coins className="h-4 w-4" /> Coins Management
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="plans">
            <div className="text-center py-8 text-gray-500">
              Arbitrage Plans management feature will be added soon.
            </div>
          </TabsContent>
          
          <TabsContent value="usdt">
            <div className="text-center py-8 text-gray-500">
              USDT Management feature will be added soon.
            </div>
          </TabsContent>
          
          <TabsContent value="coins">
            <div className="text-center py-8 text-gray-500">
              Coins Management feature will be added soon.
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="text-center py-8 text-gray-500">
              Notifications management feature will be added soon.
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminManagement;
