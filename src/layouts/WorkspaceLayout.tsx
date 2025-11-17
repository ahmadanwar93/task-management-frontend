import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { Workspace } from "@/types/workspace";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function WorkspaceLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { setCurrentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError(false);

        const response: ApiSuccessResponse<Workspace> = await apiClient.get(
          `/workspaces/${slug}`
        );
        // the idea of this is that, this parent layout is the one who will set the state of current workspace
        // so we dont have to set in each page
        setCurrentWorkspace(response.data);
      } catch (err: any) {
        console.error("Failed to fetch workspace:", err);
        setError(true);

        if (err.status === 404) {
          toast.error("Workspace not found");
        } else if (err.status === 403) {
          toast.error("You don't have access to this workspace");
        } else {
          toast.error("Failed to load workspace");
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchWorkspace();
    }

    // Cleanup when leaving workspace
    return () => {
      setCurrentWorkspace(null);
    };
  }, [slug, setCurrentWorkspace]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <Navigate to="/workspaces" replace />;
  }

  return <Outlet />;
}
