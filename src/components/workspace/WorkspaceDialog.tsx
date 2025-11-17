import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import type { ApiErrorResponse } from "@/types/api";
import {
  createWorkspaceSchema,
  type CreateWorkspaceDialogProps,
  type CreateWorkspaceFormData,
} from "@/types/workspace";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function WorkspaceDialog({
  open,
  onOpenChange,
  onSuccess, // onSuccess is just the API to fetch workspace index
}: CreateWorkspaceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      sprint_enabled: false,
      sprint_duration: null,
    },
  });

  // Watch sprint_enabled to conditionally show sprint_duration
  // kinda like a derived state from the form
  // will re renders upon changes
  const sprintEnabled = form.watch("sprint_enabled");

  const onSubmit = async (values: CreateWorkspaceFormData) => {
    try {
      setIsSubmitting(true);

      await apiClient.post("/workspaces", values);

      toast.success("Workspace created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.errors) {
        // Handle validation errors
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          form.setError(field as keyof CreateWorkspaceFormData, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error(apiError.message || "Failed to create workspace");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // the key thing to understand is that the parameter is not the current state
    // it is the target/ next state the Dialog component want to transition to
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Set up a new workspace to organize your projects and collaborate
            with your team
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Marketing Team, Product Development"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name for your workspace
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sprint_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Sprint Mode</FormLabel>
                    <FormDescription>
                      Enable time-boxed sprints for your workspace
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue("sprint_duration", null);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {sprintEnabled && (
              <FormField
                control={form.control}
                name="sprint_duration"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Sprint Duration</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        className="flex flex-col space-y-1"
                        disabled={isSubmitting}
                      >
                        {/* TODO: uncontrolled form group error */}
                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="weekly" id="weekly" />
                          </FormControl>
                          <Label
                            htmlFor="weekly"
                            className="font-normal cursor-pointer"
                          >
                            Weekly (7 days)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="biweekly" id="biweekly" />
                          </FormControl>
                          <Label
                            htmlFor="biweekly"
                            className="font-normal cursor-pointer"
                          >
                            Biweekly (14 days)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose how long each sprint should last
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isSubmitting ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
