import { useAuth } from "@/contexts/AuthContext";
import type { TaskTableProps } from "@/types/task";
import { useMemo } from "react";

export function TaskTable({
  tasks,
  searchQuery,
  statusFilter,
  assignedToFilter,
  onTaskClick,
}: TaskTableProps) {
  const { user } = useAuth();

  const filteredTasks = useMemo(() => {
    // for this elementary filter,
    return tasks.filter((task) => {
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      if (assignedToFilter === "me" && task.assigned_to !== user?.id) {
        return false;
      }
      if (assignedToFilter === "unassigned" && task.assigned_to !== null) {
        return false;
      }
      if (
        assignedToFilter !== "all" &&
        assignedToFilter !== "me" &&
        assignedToFilter !== "unassigned" &&
        task.assigned_to !== parseInt(assignedToFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, assignedToFilter, user?.id]);
  return <></>;
}
