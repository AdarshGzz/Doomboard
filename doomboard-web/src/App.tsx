import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthPage } from "./pages/Auth";
import { LandingPage } from "./pages/Landing";
import { Shell } from "./components/layout/Shell";
import { CollectedPage } from "./pages/Collected";
import { DashboardPage } from "./pages/Dashboard";
import { TrashPage } from "./pages/Trash";
import { SettingsPage } from "./pages/Settings";
import { supabase } from "./services/supabase";
import { type Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

// Robust Protected Route wrapper
function ProtectedRoute({ session, loading, children }: { session: Session | null, loading: boolean, children: React.ReactNode }) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Shell>{children}</Shell>;
}

function App() {
  console.log("App: Component rendering...");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/collected"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <CollectedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <TrashPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
