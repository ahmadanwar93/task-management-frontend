import z from "zod";

export type Task = {
  id: number;
  workspace_id: number;
  sprint_id: number | null;
  title: string;
  description: string | null;
  status: "backlog" | "todo" | "in_progress" | "done";
  due_date: string | null;
  notes: string | null; // null since it is only visible to the owner
  order: number;
  // created_by: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: {
    id: number;
    name: string;
    email: string;
  };
  created_by: {
    id: number;
    name: string;
    email: string;
  };
};

export type ViewMode = "kanban" | "table";

export type TaskTableProps = {
  tasks: Task[];
  searchQuery: string;
  statusFilter: string;
  assignedToFilter: string;
  onTaskClick: (taskId: number) => void;
  onRefresh: () => void;
};

export interface TaskSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
  workspaceSlug: string;
}

// export type taskStatuses = ["backlog", "todo", "in_progress", "done"];

// export const taskUpdateSchema = z.object({
//   title: z
//     .string()
//     .min(1, "Title is required")
//     .max(255, "Title must be less than 255 characters")
//     .trim(),
//   description: z.string().max(5000, "Description is too long").nullable(),
//   status: z.enum(taskStatuses, {
//     errorMap: () => ({ message: "Invalid status" }),
//   }),
//   assigned_to: z.number().positive().nullable(),
//   due_date: z.string().nullable(),
// });

// export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

const taskStatuses = ["backlog", "todo", "in_progress", "done"] as const;

export const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().max(5000, "Description is too long").optional(),
    status: z.enum(taskStatuses),
    assigned_to: z.string().optional(),
    due_date: z.string().optional(),
  })
  .refine(
    (data) => {
      // If status is not backlog, assigned_to is required
      if (data.status !== "backlog") {
        return data.assigned_to && data.assigned_to !== "";
      }
      return true;
    },
    {
      message: "Assigned to is required when status is not backlog",
      path: ["assigned_to"],
    }
  );

export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;
