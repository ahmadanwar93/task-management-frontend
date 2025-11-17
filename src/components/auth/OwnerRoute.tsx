import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

type OwnerOnlyProps = {
  children: ReactNode;
  fallbackPath?: string;
};

export function OwnerOnly({ children, fallbackPath }: OwnerOnlyProps) {
  const { currentWorkspace } = useWorkspace();
  const { slug } = useParams();

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (!currentWorkspace.is_owner) {
    return <Navigate to={fallbackPath || `/workspaces/${slug}`} replace />;
  }

  return <>{children}</>;
}
