import type { WorkspaceContextType } from "@/types/auth";
import type { Workspace } from "@/types/workspace";
import { createContext, useContext, useState, type ReactNode } from "react";

// it must be nullable, in case that the context is used outside of provider
const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  // currentWorkspace can be null when nothing is selected

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const userRole = currentWorkspace?.is_owner
    ? "owner"
    : currentWorkspace
    ? "guest"
    : null;
  const isOwner = userRole === "owner";
  const isGuest = userRole === "guest";

  const hasRole = (allowedRoles: ("owner" | "guest")[]) => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setCurrentWorkspace,
        workspaces,
        setWorkspaces,
        isOwner,
        isGuest,
        userRole,
        hasRole,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
};

// Flow
// /workspaces (index)
//     ↓
//     Call GET /api/workspaces
//     ↓
//     setWorkspaces([...]) ← List of all user's workspaces
//     ↓
//     User clicks on a workspace
//     ↓
// /workspaces/abc-company
//     ↓
//     Call GET /api/workspaces/abc-company
//     ↓
//     setCurrentWorkspace({...}) ← Single workspace details with is_owner
//     ↓
// /workspaces/abc-company/settings
//     ↓
//     Check hasRole(["owner"])
//     ↓
//     If false → <Forbidden />
//     If true → Show settings
