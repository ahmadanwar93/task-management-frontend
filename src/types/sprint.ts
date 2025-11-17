import z from "zod";

export const createSprintSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(255, "Sprint name cannot exceed 255 characters"),
  start_date: z.string().min(1, "Start date is required"),
});

export type CreateSprintFormData = z.infer<typeof createSprintSchema>;
