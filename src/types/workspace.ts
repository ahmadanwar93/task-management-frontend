import { z } from "zod";

export type Workspace = {
  // the type should corresponds to the API response, NOT the database, since we can add new key in the resource
  id: number;
  name: string;
  slug: string;
  is_owner: boolean;
  sprint_enabled: boolean;
  sprint_duration: "weekly" | "biweekly" | null;
  members_count?: number;
  created_at: string;
  updated_at: string;

  owner?: {
    id: number;
    name: string;
    email: string;
  };

  members?: WorkspaceMember[];
};

export type WorkspaceMember = {
  id: number;
  name: string;
  email: string;
  role: "owner" | "guest"; // From pivot table
  joined_at: string; // From pivot table
};

export const createWorkspaceSchema = z
  .object({
    name: z
      .string()
      .min(1, "Workspace name is required")
      .max(255, "Name is too long"),
    sprint_enabled: z.boolean(),
    sprint_duration: z.enum(["weekly", "biweekly"]).nullable(),
  })
  .refine(
    (data) => {
      // If sprint is enabled, sprint_duration is required
      if (data.sprint_enabled && !data.sprint_duration) {
        return false;
      }
      return true;
    },
    {
      message: "Sprint duration is required when sprint mode is enabled",
      path: ["sprint_duration"],
    }
  )
  .refine(
    (data) => {
      // If sprint is disabled, sprint_duration must be null
      if (!data.sprint_enabled && data.sprint_duration) {
        return false;
      }
      return true;
    },
    {
      message: "Sprint duration must be empty when sprint mode is disabled",
      path: ["sprint_duration"],
    }
  );

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export type EmptyWorkspaceProps = {
  onCreateClick: () => void;
};

export type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
