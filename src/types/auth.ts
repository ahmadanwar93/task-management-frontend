import type { Workspace } from "./workspace";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export type WorkspaceContextType = {
  currentWorkspace: Workspace | null;
  // currentWorkspace is the workspace the user is currently viewing.
  // the currentWorkspace can be null, when the user is not viewing any workspace, for example in the /workspaces page
  // or when the currentWorkspace is not being loaded yet
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  // we want to set the workspace back to null when we leave the workspace, and when the workspaceLayout unmount
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  isOwner: boolean;
  isGuest: boolean;
  userRole: "owner" | "guest" | null;
  // user role can be null if user at the /workspaces page
  hasRole: (allowedRoles: ("owner" | "guest")[]) => boolean;
};
