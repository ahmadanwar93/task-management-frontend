export type Task = {
  id: number;
  workspace_id: number;
  sprint_id: number | null;
  title: string;
  description: string | null;
  status: "backlog" | "todo" | "in_progress" | "done";
  due_date: string | null;
  assigned_to: number | null;
  notes: string | null; // null since it is only visible to the owner
  order: number;
  created_by: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_user?: {
    id: number;
    name: string;
    email: string;
  };
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type Sprint = {
  id: number;
  workspace_id: number;
  name: string;
  status: "planned" | "active" | "completed";
  start_date: string | null;
  end_date: string | null;
  is_eternal: boolean;
  created_at: string;
  updated_at: string;
  days_remaining?: number | null;
  days_elapsed?: number | null;
  duration?: number | null;
};
