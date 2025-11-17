import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Link, useParams } from "react-router-dom";

export function WorkspaceNav() {
  const { currentWorkspace } = useWorkspace();
  const { slug } = useParams();

  return (
    <div className="flex items-center gap-6">
      <div className="font-semibold">
        {currentWorkspace?.name || "Workspace"}
      </div>

      <nav className="flex gap-4">
        <Link
          to={`/workspaces/${slug}`}
          className="text-sm font-medium hover:text-primary"
        >
          Board
        </Link>
        <Link
          to={`/workspaces/${slug}/backlog`}
          className="text-sm font-medium hover:text-primary"
        >
          Backlog
        </Link>
        <Link
          to={`/workspaces/${slug}/history`}
          className="text-sm font-medium hover:text-primary"
        >
          History
        </Link>
      </nav>
    </div>
  );
}
