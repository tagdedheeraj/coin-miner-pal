
import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CombinedAuthProvider } from '@/contexts/auth/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { MiningProvider } from '@/contexts/MiningContext';

// Pages
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminPanel from '@/pages/AdminPanel';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Mining from '@/pages/Mining';
import Rewards from '@/pages/Rewards';
import Wallet from '@/pages/Wallet';
import Referral from '@/pages/Referral';
import Plans from '@/pages/Plans';
import NotFound from '@/pages/NotFound';

// Layout components
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

// Route protection components
const AuthRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" />;
};

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  return user?.isAdmin ? <Outlet /> : <Navigate to="/dashboard" />;
};

const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
};

// Layout with both header and bottom navigation
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 pb-20 md:pb-4 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

// Navigation handler to prevent app from closing on back button
const NavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we're at the root path and user presses back, prevent the default action
      // which would close the app, and navigate to a safe path instead
      if (location.pathname === '/') {
        event.preventDefault();
        // Navigate to another page or show a dialog
        navigate('/dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);

  return null;
};

function App() {
  return (
    <CombinedAuthProvider>
      <MiningProvider>
        <NavigationHandler />
        <Routes>
          {/* Guest routes (no auth required) */}
          <Route element={<GuestRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Protected routes (auth required) */}
          <Route element={<AuthRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mining" element={<Mining />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/plans" element={<Plans />} />
            </Route>
          </Route>
          
          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
          </Route>
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </MiningProvider>
    </CombinedAuthProvider>
  );
}

export default App;
