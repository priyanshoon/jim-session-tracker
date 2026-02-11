import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="state-screen">
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
