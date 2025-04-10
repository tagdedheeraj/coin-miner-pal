
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
import Withdrawal from '@/pages/Withdrawal';
import Referrals from '@/pages/Referrals';
import Arbitrage from '@/pages/Arbitrage';
import AdminDashboard from '@/pages/AdminDashboard'; // Updated import path
import ScrollToTop from '@/components/shared/ScrollToTop';

function App() {
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
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/arbitrage" element={<Arbitrage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
