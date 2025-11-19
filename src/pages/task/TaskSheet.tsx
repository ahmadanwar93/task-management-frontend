import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Task } from "@/types/task";
import { Calendar, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import type { User } from "@/types/auth";

interface TaskSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
  workspaceSlug: string;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    todo: "bg-gray-100 hover:bg-gray-600",
    "in-progress": "bg-blue-300 hover:bg-blue-600",
    backlog: "bg-yellow-300 hover:bg-yellow-600",
    done: "bg-green-300 hover:bg-green-600",
  };
  return colors[status] || "bg-gray-500";
};

export function TaskSheet({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
  workspaceSlug,
}: TaskSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [members, setMembers] = useState<User[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignedTo(task.assigned_to?.toString() || "");
      setDueDate(task.due_date || "");
    }
  }, [task]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response: ApiSuccessResponse<User[]> = await apiClient.get(
          `/workspaces/${workspaceSlug}`
        );
        console.log(response);
        setMembers(response.data);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    if (open) {
      fetchMembers();
    }
  }, [workspaceSlug, open]);

  const handleSave = async () => {
    if (!task) return;

    try {
      setIsSaving(true);

      const payload = {
        title,
        description,
        status,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        due_date: dueDate || null,
      };

      const response: ApiSuccessResponse<Task> = await apiClient.put(
        `/workspaces/${workspaceSlug}/tasks/${task.id}`,
        payload
      );

      onTaskUpdated(response.data);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/workspaces/${workspaceSlug}/tasks/${task.id}`);
      onTaskDeleted(task.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssignedTo(task.assigned_to?.toString() || "");
      setDueDate(task.due_date || "");
    }
    setIsEditing(false);
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Task title"
              />
            ) : (
              task.title
            )}
          </SheetTitle>
          <SheetDescription>Task details and information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          <div className="space-y-2">
            <Label>Status</Label>
            {isEditing ? (
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={"outline"}>
                {task.status.replace("-", " ").toUpperCase()}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="assigned-to" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Assigned To
            </Label>
            {isEditing ? (
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id="assigned-to">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : task.assigned_to_user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <Avatar>
                    {task.assigned_to_user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {task.assigned_to_user.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.assigned_to_user.email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Unassigned</div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="due-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            {isEditing ? (
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            ) : task.due_date ? (
              <div>{new Date(task.due_date).toLocaleDateString()}</div>
            ) : (
              <div className="text-muted-foreground">No due date</div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={6}
              />
            ) : task.description ? (
              <div className="text-sm whitespace-pre-wrap">
                {task.description}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No description provided
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created by:</span>{" "}
              {task.created_by_user?.name || "Unknown"}
            </div>
            <div>
              <span className="font-medium">Created at:</span>{" "}
              {new Date(task.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated at:</span>{" "}
              {new Date(task.updated_at).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the task.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
