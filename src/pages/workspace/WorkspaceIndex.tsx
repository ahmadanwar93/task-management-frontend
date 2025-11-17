import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { Workspace } from "@/types/workspace";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { WorkspaceDialog } from "@/components/workspace/WorkspaceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyWorkspace } from "@/components/workspace/EmptyWorkspace";

export default function WorkspaceIndex() {
  const { workspaces, setWorkspaces } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response: ApiSuccessResponse<Workspace[]> = await apiClient.get(
        "/workspaces"
      );
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {workspaces.length === 0 ? (
        <EmptyWorkspace onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Workspaces</h1>
              <p className="text-muted-foreground mt-1">
                Manage your projects and collaborate with your team
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        </div>
      )}
      <WorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchWorkspaces}
      />
    </>
  );
}
