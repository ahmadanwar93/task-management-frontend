import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  taskUpdateSchema,
  type Task,
  type TaskSheetProps,
  type TaskUpdateFormData,
} from "@/types/task";
import { Calendar, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function TaskSheet({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
  workspaceSlug,
}: TaskSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentWorkspace } = useWorkspace();
  const members = currentWorkspace?.members || [];

  const form = useForm<TaskUpdateFormData>({
    resolver: zodResolver(taskUpdateSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      assigned_to: "",
      due_date: "",
    },
  });
  console.log(task);
  // Watch status changes to automatically clear assigned_to when status is backlog
  const currentStatus = form.watch("status");

  useEffect(() => {
    if (currentStatus === "backlog") {
      form.setValue("assigned_to", "");
    }
  }, [currentStatus, form]);

  // Initialize form when task changes
  useEffect(() => {
    // it should be noted that on first render, although the task sheet is closed. The code still runs, hence task is null
    if (task) {
      const assigneeId = task.assigned_to?.id;

      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        assigned_to: assigneeId?.toString() || "",
        due_date: task.due_date || "",
      });
    }
  }, [task]);

  const onSubmit = async (values: TaskUpdateFormData) => {
    if (!task) return;

    try {
      setIsSaving(true);

      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        status: values.status,
        assigned_to: values.assigned_to ? Number(values.assigned_to) : null,
        due_date: values.due_date || null,
      };

      const response: ApiSuccessResponse<Task> = await apiClient.patch(
        `/workspaces/${workspaceSlug}/tasks/${task.id}`,
        payload
      );

      // pass in the new task that gets updated, and the new state gets set
      // kinda like optimisitc update
      // so we dont have to refetch the task list
      onTaskUpdated(response.data);
      onOpenChange(false);
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
      // from our API, we dont return the deleted task. We return null for the data value
      onTaskDeleted(task.id);
      onOpenChange(false);
      toast.success("Task deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDiscard = () => {
    //when user change anything in the form, it is changing the form values, not the original task state
    if (task) {
      const assigneeId = task.assigned_to?.id;

      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        assigned_to: assigneeId?.toString() || "",
        due_date: task.due_date || "",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && form.formState.isDirty) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirm) return;
    }
    onOpenChange(open);
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <Form {...form}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Task title"
                        className="text-lg font-semibold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </SheetTitle>
          <SheetDescription className="flex justify-between">
            Task details and information
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the task "{task.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 px-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Assigned To
                    {currentStatus !== "backlog" && (
                      <span className="text-destructive">*</span>
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "unassigned" ? "" : value)
                    }
                    value={field.value || "unassigned"}
                    disabled={isSaving || currentStatus === "backlog"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id.toString()}
                        >
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentStatus === "backlog" && (
                    <p className="text-xs text-muted-foreground">
                      Assignee is not required for backlog tasks
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a description..."
                      rows={8}
                      className="resize-none"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created by:</span>{" "}
                {typeof task.created_by === "object"
                  ? task.created_by?.name
                  : "-"}
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

            <div className="flex justify-end gap-2 pt-4">
              {form.formState.isDirty && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={isSaving}
                  >
                    Discard Changes
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
