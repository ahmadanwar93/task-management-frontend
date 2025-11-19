import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { format, addDays } from "date-fns";
import apiClient from "@/lib/api";
import type { ApiErrorResponse } from "@/types/api";
import { createSprintSchema, type CreateSprintFormData } from "@/types/sprint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type CreateSprintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CreateSprintDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSprintDialogProps) {
  const { slug } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<CreateSprintFormData>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: "",
      start_date: "",
    },
  });

  const isEternalWorkspace = currentWorkspace?.sprint_duration === null;
  const sprintDuration = currentWorkspace?.sprint_duration;
  const durationDays =
    sprintDuration === "weekly" ? 7 : sprintDuration === "biweekly" ? 14 : null;

  const onSubmit = async (values: CreateSprintFormData) => {
    try {
      setIsSubmitting(true);

      // Build payload based on workspace type
      const payload: any = {
        name: values.name,
        start_date: values.start_date,
        workspace_id: currentWorkspace?.id,
      };

      if (isEternalWorkspace) {
        payload.is_eternal = true;
        payload.end_date = null;
      } else {
        // if normal sprint, then we calculate the end date
        payload.is_eternal = false;
        const startDate = new Date(values.start_date + "T00:00:00");
        const endDate = addDays(startDate, durationDays!);
        payload.end_date = format(endDate, "yyyy-MM-dd");
      }

      await apiClient.post(`/workspaces/${slug}/sprints`, payload);

      toast.success("Sprint created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const apiError = error as ApiErrorResponse;

      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          // TODO: find a better ways to display the error. Some of the form fields are hidden
          form.setError(field as keyof CreateSprintFormData, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error(apiError.message || "Failed to create sprint");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  const getDescription = () => {
    if (isEternalWorkspace) {
      return "Create a simple project management tracker.";
    }
    return `Create a new ${sprintDuration} sprint (${durationDays} days).`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sprint 1, Q4 Sprint, November Sprint"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name for your sprint
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(new Date(field.value + "T00:00:00"), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? new Date(field.value + "T00:00:00")
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                            setIsCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When should this sprint start?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEternalWorkspace && form.watch("start_date") && (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <h4 className="font-medium mb-2">Sprint Details</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • Duration: {durationDays} days ({sprintDuration})
                  </li>
                  <li>
                    • End Date:{" "}
                    {format(
                      addDays(
                        new Date(form.watch("start_date") + "T00:00:00"),
                        durationDays!
                      ),
                      "PPP"
                    )}
                  </li>
                  <li>• Status: Planned</li>
                </ul>
              </div>
            )}

            {isEternalWorkspace && (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <h4 className="font-medium mb-2">Sprint Details</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Type: Eternal Sprint</li>
                  <li>• No end date (continuous workflow)</li>
                  <li>• Status: Planned</li>
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Sprint"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
