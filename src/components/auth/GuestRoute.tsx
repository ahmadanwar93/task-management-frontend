import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { Spinner } from "../ui/spinner";
import { Navigate } from "react-router-dom";

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/workspaces" replace />;
  }

  return <>{children}</>;
}
