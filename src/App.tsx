import React, { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { Shell } from '@/components/layout/Shell';
import { setBaseUrl } from '@workspace/api-client-react/custom-fetch';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import VerifyEmail from '@/pages/VerifyEmail';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import Groups from '@/pages/Groups';
import Feed from '@/pages/Feed';
import Marketplace from '@/pages/Marketplace';
import Insurance from '@/pages/Insurance';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import CartPage from '@/pages/Cart';

import NotFound from '@/pages/not-found';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/onboarding" component={Onboarding} />

        {/* Protected Routes */}
        <Route path="/home" component={Home} />
        <Route path="/discover" component={Discover} />
        <Route path="/groups" component={Groups} />
        <Route path="/feed" component={Feed} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/insurance" component={Insurance} />
        <Route path="/messages" component={Messages} />
        <Route path="/search" component={Discover} />
        <Route path="/cart" component={CartPage} />
        <Route path="/profile" component={Profile} />

        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  useEffect(() => {
    setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
          </AuthProvider>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;