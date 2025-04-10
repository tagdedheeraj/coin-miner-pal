
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { CombinedAuthProvider } from "./contexts/auth/AuthProvider";
import { MiningProvider } from "./contexts/MiningContext";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import Mining from "./pages/Mining";
import Rewards from "./pages/Rewards";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Referral from "./pages/Referral";
import Plans from "./pages/Plans";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Navigation handler component
const NavigationHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle hardware back button
    const handleBackButton = (event: PopStateEvent) => {
      // If we're not at the root path, prevent default behavior
      if (location.pathname !== '/') {
        event.preventDefault();
        // Navigate using react-router instead of browser navigation
        navigate(-1);
      }
    };

    // Add event listener for popstate (back button)
    window.addEventListener('popstate', handleBackButton);

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate, location]);

  return <>{children}</>;
};

const App = () => (
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CombinedAuthProvider>
          <MiningProvider>
            <TooltipProvider>
              <NavigationHandler>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/mining" element={<Mining />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </NavigationHandler>
            </TooltipProvider>
          </MiningProvider>
        </CombinedAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

export default App;
