
import React, { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface MiningLayoutProps {
  children: ReactNode;
}

const MiningLayout: React.FC<MiningLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default MiningLayout;
