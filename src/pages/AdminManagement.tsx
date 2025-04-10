
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabsList from '@/components/admin/AdminTabsList';
import UsersTabContent from '@/components/admin/tabs/UsersTabContent';
import PlansTabContent from '@/components/admin/tabs/PlansTabContent';
import UsdtTabContent from '@/components/admin/tabs/UsdtTabContent';
import CoinsTabContent from '@/components/admin/tabs/CoinsTabContent';
import NotificationsTabContent from '@/components/admin/tabs/NotificationsTabContent';

const AdminManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <AdminHeader />
        
        <Tabs defaultValue="users" className="w-full">
          <AdminTabsList />
          
          <TabsContent value="users">
            <UsersTabContent />
          </TabsContent>
          
          <TabsContent value="plans">
            <PlansTabContent />
          </TabsContent>
          
          <TabsContent value="usdt">
            <UsdtTabContent />
          </TabsContent>
          
          <TabsContent value="coins">
            <CoinsTabContent />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsTabContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminManagement;
