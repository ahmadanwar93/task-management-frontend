import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { Sprint } from "@/types/sprint";
import type { Task } from "@/types/task";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { TaskDataTable } from "./TaskDataTable";
import { TaskSheet } from "./TaskSheet";
import { CreateTaskDialog } from "./CreateTaskDialog";

export function TaskBoardPage() {
  const { slug, sprintId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWorkspace && sprintId) {
      fetchData();
    }
  }, [sprintId, currentWorkspace]);

  const fetchData = async () => {
    if (!sprintId) {
      toast.error("Sprint id is required");
      return;
    }

    try {
      setLoading(true);
      // we have to make sure the sprint id is a valid one
      const sprintResponse: ApiSuccessResponse<Sprint> = await apiClient.get(
        `/workspaces/${slug}/sprints/${sprintId}`
      );
      setCurrentSprint(sprintResponse.data);

      // fetch all the tasks to pass to DataTable
      const taskResponse: ApiSuccessResponse<Task[]> = await apiClient.get(
        `/workspaces/${slug}/tasks?sprint_id=${sprintId}`
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

  // once the row is clicked. We want to open the sheet with the selected task
  // in the TableRow, we will pass in row.original which is the task object
  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully");
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    console.log(updatedTask);
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    toast.success("Task updated successfully");
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setIsSheetOpen(false);
    toast.success("Task deleted successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentSprint?.name || "Sprint Tasks"}
          </h1>
          <p className="text-muted-foreground">
            Manage and track tasks for this sprint
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <TaskDataTable data={tasks} onRowClick={handleRowClick} />

      <TaskSheet
        task={selectedTask}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        workspaceSlug={slug!}
      />

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
        sprintId={Number(sprintId)}
        workspaceSlug={slug!}
      />
    </div>
  );
}
