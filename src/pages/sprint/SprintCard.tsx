import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sprint } from "@/types/sprint";
import { Calendar, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { EditSprintDialog } from "./EditSprintDialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type SprintCardProps = {
  sprint: Sprint;
  onUpdate: () => void;
};

export function SprintCard({ sprint, onUpdate }: SprintCardProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useWorkspace();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/workspaces/${slug}/tasks?sprint_id=${sprint.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking edit
    // else would click on the card as well
    setIsEditDialogOpen(true);
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
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <CardTitle className="text-xl">{sprint.name}</CardTitle>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {sprint.is_eternal ? (
            <div className="text-sm text-muted-foreground">
              <Badge variant="outline">Eternal Sprint</Badge>
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

      {isOwner && (
        <EditSprintDialog
          sprint={sprint}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}
