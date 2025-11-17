import { Button } from "@/components/ui/button";
import type { EmptyWorkspaceProps } from "@/types/workspace";
import { FolderPlus, Plus } from "lucide-react";

export function EmptyWorkspace({ onCreateClick }: EmptyWorkspaceProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <FolderPlus className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No workspaces yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first workspace to start organizing tasks and collaborating
        with your team
      </p>
      <Button onClick={onCreateClick} size="lg" className="cursor-pointer">
        <Plus className="mr-2 h-5 w-5" />
        Create Your First Workspace
      </Button>
    </div>
  );
}
