
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Shield, Activity, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const features = [
    {
      icon: Activity,
      color: 'text-brand-blue',
      bgColor: 'bg-brand-blue/10',
      title: 'Mine Coins',
      description: 'Earn 2 coins hourly by mining Infinium',
    },
    {
      icon: Award,
      color: 'text-brand-green',
      bgColor: 'bg-brand-green/10',
      title: 'Watch & Earn',
      description: 'View ads and complete tasks for rewards',
    },
    {
      icon: Shield,
      color: 'text-brand-indigo',
      bgColor: 'bg-brand-indigo/10',
      title: 'Secure Wallet',
      description: 'Store and withdraw your earnings safely',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="container px-4 py-12 max-w-lg mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="coin w-24 h-24 mx-auto text-3xl animate-coin-spin">₹</div>
              <div className="absolute -top-2 -right-2 bg-brand-green text-white text-xs px-2 py-1 rounded-full">
                New
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gradient">Infinium Miner</h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
            Mine cryptocurrency, earn rewards, and build your digital assets with our innovative platform.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/sign-up')}
              className="w-full h-14 bg-brand-blue hover:bg-brand-blue/90 rounded-xl font-medium text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/sign-in')}
              className="w-full h-14 rounded-xl border-gray-200 hover:bg-gray-100 font-medium text-lg transition-colors"
            >
              Sign In
            </Button>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 mb-10 animate-scale-up">
          <h2 className="text-xl font-semibold mb-6">Sign up bonus</h2>
          
          <div className="bg-gradient-to-r from-brand-yellow to-brand-orange p-5 rounded-xl text-white mb-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Welcome Bonus</p>
              <p className="text-3xl font-bold mb-1">200 Coins</p>
              <p className="text-sm opacity-90">($4.00 USD value)</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Create your account today and receive 200 Infinium coins as a welcome gift!
          </p>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-6">How it works</h2>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass-card rounded-xl p-5 flex items-start animate-scale-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-full ${feature.bgColor} flex items-center justify-center mr-4 mt-1`}>
                  <feature.icon className={feature.color} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 mb-10 animate-scale-up animation-delay-300">
          <h2 className="text-xl font-semibold mb-4">Refer & Earn</h2>
          
          <div className="bg-gradient-to-r from-brand-indigo to-brand-blue p-5 rounded-xl text-white mb-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Per Referral</p>
              <p className="text-3xl font-bold mb-1">250 Coins</p>
              <p className="text-sm opacity-90">($5.00 USD value)</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/sign-up')}
            className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between px-4"
          >
            <span className="font-medium">Start referring now</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
        
        <div className="text-center text-gray-500 text-sm mb-6">
          <p>By using Infinium, you agree to our</p>
          <div className="flex justify-center space-x-2">
            <button className="text-brand-blue underline">Terms of Service</button>
            <span>&</span>
            <button className="text-brand-blue underline">Privacy Policy</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
