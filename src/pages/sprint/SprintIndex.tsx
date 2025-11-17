import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { Sprint } from "@/types/task";
import { CalendarOff, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { SprintCard } from "./SprintCard";
import { CreateSprintDialog } from "./CreateSprintDialog";

export default function SprintIndex() {
  const { slug } = useParams(); // the slug from url query params are needed to get the sprints
  // the slug is a valid one, that is corresponds to the workspace
  // if the slug is invalid, workspaceLayout would redirect back to /workspace
  const { currentWorkspace, isOwner } = useWorkspace();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchSprints();
    }
  }, [currentWorkspace, slug]);
  // TODO: why currentWorkspace though?

  const fetchSprints = async () => {
    // we do not put sprintinto a global context, so will have to fetch the related tasks in each page later
    // check if it can be condensed, where we can only fetch sprint and related task once
    try {
      setLoading(true);
      const response: ApiSuccessResponse<Sprint[]> = await apiClient.get(
        `/workspaces/${slug}/sprints`
      );
      setSprints(response.data);
    } catch (error) {
      toast.error("Failed to fetch sprints:");
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

  if (sprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <CalendarOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No sprints yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first sprint to start organizing tasks in time-boxed
          iterations
        </p>
        {isOwner && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Sprint
          </Button>
        )}
        <CreateSprintDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={fetchSprints}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sprints</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sprints and track progress
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sprint
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sprints.map((sprint) => (
          <SprintCard key={sprint.id} sprint={sprint} onUpdate={fetchSprints} />
        ))}
      </div>
      {isOwner && (
        <CreateSprintDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={fetchSprints}
        />
      )}
    </div>
  );
}
