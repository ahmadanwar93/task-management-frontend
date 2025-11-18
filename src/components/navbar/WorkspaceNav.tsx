import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Link, useLocation, useParams } from "react-router-dom";

export function WorkspaceNav() {
  const { currentWorkspace } = useWorkspace();
  const { slug } = useParams();

  const location = useLocation();

  const tabs = [
    { label: "Sprints", path: `/workspaces/${slug}`, exact: true },
    { label: "Tasks", path: `/workspaces/${slug}/tasks` },
    { label: "Backlog", path: `/workspaces/${slug}/backlog` },
    { label: "History", path: `/workspaces/${slug}/history` },
  ];

  const isActiveTab = (path: string, exact?: boolean) => {
    // we need exact because all the paths starts with //workspaces/${slug}
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex items-center gap-6">
      <Link className="font-semibold text-lg" to={`/workspaces`}>
        {currentWorkspace?.name || "Workspace"}
      </Link>

      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActiveTab(tab.path, tab.exact)
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
