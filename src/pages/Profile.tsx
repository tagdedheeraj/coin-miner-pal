
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/profile/ProfileCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-1">Profile</h1>
            <p className="text-gray-500">Manage your account settings</p>
          </div>
        </div>
        
        <ProfileCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
