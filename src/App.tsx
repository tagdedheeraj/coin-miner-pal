
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from 'sonner';
import AuthProvider from '@/contexts/auth/AuthProvider';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import AuthCallback from '@/pages/AuthCallback';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import WithdrawalPage from '@/pages/Withdrawal';
import ReferralsPage from '@/pages/Referrals';
import ArbitragePage from '@/pages/Arbitrage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ScrollToTop from '@/components/shared/ScrollToTop';

function App() {
  // Add console log for debugging
  console.log('App component rendering');
  
  try {
    return (
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/withdrawal" element={<WithdrawalPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/arbitrage" element={<ArbitragePage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </Router>
      </AuthProvider>
    );
  } catch (error) {
    console.error('Error rendering App:', error);
    return <div>Error loading application. Please check console.</div>;
  }
}

export default App;
