import { Switch, Route } from "wouter";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

// Simple global variable to prevent excessive authentication attempts
if (typeof window !== 'undefined' && !window.hasOwnProperty('authAttemptMade')) {
  (window as any).authAttemptMade = false;
}

/**
 * Wrapper component that prevents excessive API calls to check authentication
 */
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Only check authentication once per session
    if (!(window as any).authAttemptMade) {
      // Make a single auth check and mark as complete
      fetch('/api/me', { credentials: 'include' })
        .then(res => {
          (window as any).authAttemptMade = true;
          setLoading(false);
          console.log('Auth check complete');
        })
        .catch(() => {
          (window as any).authAttemptMade = true;
          setLoading(false);
          console.log('Auth check failed, continuing without retry');
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthWrapper>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthWrapper>
  );
}

export default App;
