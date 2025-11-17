import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Workspace } from "@/types/workspace";
import { Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type WorkspaceCardProps = {
  workspace: Workspace;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/workspaces/${workspace.slug}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{workspace.name}</CardTitle>
          <Badge variant={workspace.is_owner ? "default" : "secondary"}>
            {workspace.is_owner ? "Owner" : "Guest"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{workspace.members_count || 0} members</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Created at {new Date(workspace.created_at).toLocaleDateString()}
          </span>
        </div>

        {workspace.sprint_enabled && (
          <Badge variant="outline">{workspace.sprint_duration}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
