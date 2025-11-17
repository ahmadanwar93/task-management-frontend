import z from "zod";
import type { Task } from "./task";

export const createSprintSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(255, "Sprint name cannot exceed 255 characters"),
  start_date: z.string().min(1, "Start date is required"),
});

export type CreateSprintFormData = z.infer<typeof createSprintSchema>;
export type SprintStatus = "planned" | "active" | "completed";

export type Sprint = {
  id: number;
  name: string;
  status: SprintStatus;
  start_date: string;
  end_date: string | null; // Nullable for eternal sprints
  is_eternal: boolean;
  days_remaining: number | null; // null for eternal or completed sprints
  days_elapsed: number;
  duration: number | null; // null for eternal sprints
  tasks_count?: number; // Optional, only present when counted
  tasks?: Task[]; // Optional, only present when loaded
  created_at: string;
  updated_at: string;
};

export const updateSprintSchema = z
  .object({
    name: z
      .string()
      .min(1, "Sprint name is required")
      .max(255, "Sprint name cannot exceed 255 characters")
      .optional(),
    start_date: z.string().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(["planned", "active", "completed"]).optional(),
  })
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return new Date(data.end_date) > new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

export type UpdateSprintFormData = z.infer<typeof updateSprintSchema>;

export type EditSprintDialogProps = {
  sprint: Sprint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
