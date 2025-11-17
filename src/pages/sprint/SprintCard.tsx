import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Sprint } from "@/types/task";
import { Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

type SprintCardProps = {
  sprint: Sprint;
  onUpdate: () => void;
};

export function SprintCard({
  sprint,
}: // onUpdate
SprintCardProps) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/workspaces/${slug}/tasks?sprint_id=${sprint.id}`);
  };

  const getStatusBadge = () => {
    switch (sprint.status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "planned":
        return <Badge variant="secondary">Planned</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{sprint.name}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {sprint.is_eternal ? (
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">Eternal Sprint</Badge>
            <p className="mt-2">This sprint has no end date</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            {sprint.duration && (
              <div className="text-sm text-muted-foreground">
                Duration: {sprint.duration} days
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
