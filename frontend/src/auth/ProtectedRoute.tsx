import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "./useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="state-screen">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
