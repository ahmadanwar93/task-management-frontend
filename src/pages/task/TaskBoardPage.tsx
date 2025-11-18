import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiSuccessResponse } from "@/types/api";
import type { Sprint } from "@/types/sprint";
import type { Task, ViewMode } from "@/types/task";
import { TableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { TaskTable } from "./TaskTable";

// url structure /workspaces/{slug}/tasks?sprint_id={sprintId}
export function TaskBoardPage() {
  // useParams if for URL path (part of the route structure to be used for route matching)
  const { slug, sprintId } = useParams();
  // url query parameters are key value pairs from query string
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWorkspace) {
      fetchData();
    }
  }, [sprintId]);

  if (!sprintId) {
    // the sprint id must exists by default since we are using the sprint id to match in app.tsx
    // but we have to do this early return because sprintId might be null from TS
    toast.error("Sprint id is required");

    return;
  }
  const fetchData = async () => {
    try {
      // we do try and catch because axios interceptor would throw error, we have to catch it
      setLoading(true);
      const sprintResponse: ApiSuccessResponse<Sprint> = await apiClient.get(
        `/workspaces/${slug}/sprints/${sprintId}`
      );
      setCurrentSprint(sprintResponse.data);

      const params = new URLSearchParams();
      params.append("sprint_id", sprintId);
      const taskResponse: ApiSuccessResponse<Task[]> = await apiClient.get(
        `/workspaces/${slug}/tasks?${params.toString()}`
      );
      setTasks(taskResponse.data);
    } catch (err: any) {
      if (err.status === 404) {
        toast.error("Sprint not found");
        navigate(`/workspaces/${slug}`);
      } else if (err.status === 403) {
        toast.error("You don't have access to this sprint");
        navigate(`/workspaces/${slug}`);
      } else {
        toast.error("Failed to load sprint and tasks");
        navigate(`/workspaces/${slug}`);
      }
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {currentWorkspace?.sprint_enabled && currentSprint && (
            <SprintInfo sprint={currentSprint} onSprintComplete={fetchData} />
          )}
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className={"gap-2"}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={cn("gap-2")}
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        assignedToFilter={assignedToFilter}
        onAssignedToChange={setAssignedToFilter}
      />

      {viewMode === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={setTasks}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          assignedToFilter={assignedToFilter}
          onRefresh={fetchData}
          onTaskClick={setSelectedTaskId}
        />
      ) : (
        <TaskTable
          tasks={tasks}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          assignedToFilter={assignedToFilter}
          onTaskClick={setSelectedTaskId}
          onRefresh={fetchData}
        />
      )}

      <TaskDetailSheet
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        onTaskUpdate={fetchData}
      />
    </div>
  );
}
