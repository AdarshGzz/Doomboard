import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/Auth";
import { Shell } from "./components/layout/Shell";
import { CollectedPage } from "./pages/Collected";
import { DashboardPage } from "./pages/Dashboard";
import { TrashPage } from "./pages/Trash";
import { SettingsPage } from "./pages/Settings";

// Simple Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = localStorage.getItem("doomboard_session");
  // Simple check for now. In real app, check expiration or validate token.
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return <Shell>{children}</Shell>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/collected"
          element={
            <ProtectedRoute>
              <CollectedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <TrashPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
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
