import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types/task";
import type { ApiSuccessResponse } from "@/types/api";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
  sprintId: number;
  workspaceSlug: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  sprintId,
  workspaceSlug,
}: CreateTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const members = currentWorkspace?.members || [];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setAssignedTo("");
    setDueDate("");
  };
  // TODO: zod validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        sprint_id: sprintId,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        due_date: dueDate || null,
      };

      const response: ApiSuccessResponse<Task> = await apiClient.post(
        `/workspaces/${workspaceSlug}/tasks`,
        payload
      );

      onTaskCreated(response.data);
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this sprint. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-to">Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assigned-to">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
