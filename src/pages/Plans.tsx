
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import PlansCard from '@/components/plans/PlansCard';

const Plans: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Verify the new QR code image is accessible
  useEffect(() => {
    const qrCodePath = '/lovable-uploads/8d28d83b-7d3b-464b-9af1-0fc4132befc1.png';
    console.log('Verifying QR code at path:', qrCodePath);
    
    const img = new Image();
    img.onload = () => console.log('QR Code verified as loadable');
    img.onerror = (e) => console.error('QR Code could not be loaded from URL:', e);
    img.src = qrCodePath;
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Mining Plans</h1>
          <p className="text-gray-500">Boost your mining with premium plans and earn USDT daily</p>
        </div>
        
        <PlansCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Plans;
