import { UserMenu } from "@/components/navbar/UserMenu";
import { WorkspaceNav } from "@/components/navbar/WorkspaceNav";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Outlet } from "react-router-dom";

export function AuthenticatedLayout() {
  const { currentWorkspace } = useWorkspace();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            {currentWorkspace ? (
              <WorkspaceNav />
            ) : (
              <h1 className="text-xl font-semibold">My Workspaces</h1>
            )}
          </div>

          <UserMenu />
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {/* Outlet is when we are creating a layout for nested route */}
        {/* Let react router dom to pass in the children dynamically */}
        <Outlet />
      </main>
    </div>
  );
}
