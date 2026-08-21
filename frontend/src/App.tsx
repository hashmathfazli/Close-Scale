/**
 * App — root routing configuration.
 *
 * Route structure:
 *   /login          — public (redirects to / if already logged in)
 *   /               — protected (requires auth)
 *   /*              — 404 fallback
 */

import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RoleDashboardPage from "./pages/RoleDashboardPage";
import Layout from "./components/Layout";
import UsersPage from "./pages/admin/UsersPage";
import ActivatePage from "./pages/ActivatePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

export default function App() {
  const { currentUser, isLoading } = useAuth();

  // Don't render routes until the session is restored
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <Routes>
      {/* Public route — redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      <Route path="/activate/:uid/:token" element={<ActivatePage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<RoleDashboardRedirect />} />
          <Route path="/settings/security" element={<ChangePasswordPage />} />

          <Route element={<PrivateRoute allowedRoles={["SALES_REP"]} />}>
            <Route path="/sales-rep/*" element={<RoleDashboardPage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["SALES_MANAGER"]} />}>
            <Route path="/sales-manager/*" element={<RoleDashboardPage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["TECH_LEAD"]} />}>
            <Route path="/tech-lead/*" element={<RoleDashboardPage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["FINANCE_OFFICER"]} />}>
            <Route path="/finance/*" element={<RoleDashboardPage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<RoleDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RoleDashboardRedirect() {
  const { currentUser } = useAuth();
  const destinations = {
    SALES_REP: "/sales-rep",
    SALES_MANAGER: "/sales-manager",
    TECH_LEAD: "/tech-lead",
    FINANCE_OFFICER: "/finance",
    ADMIN: "/admin",
  } as const;
  return <Navigate to={destinations[currentUser?.role ?? "ADMIN"]} replace />;
}

/** Minimal full-screen loader shown while the auth session is being restored. */
function AppLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--palette-tea-green)",
        color: "var(--palette-teal)",
        fontSize: "1.5rem",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 32,
          height: 32,
          border: "3px solid rgba(56,163,165,0.25)",
          borderTopColor: "var(--palette-teal)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
