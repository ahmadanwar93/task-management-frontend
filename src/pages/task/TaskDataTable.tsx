import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/task";
import { useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface TaskDataTableProps {
  data: Task[];
  onRowClick: (task: Task) => void;
}

export function TaskDataTable({ data, onRowClick }: TaskDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { currentWorkspace } = useWorkspace();

  const members = currentWorkspace?.members || [];

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      // accessorKey must refer to the actual key in the Task object
      // header is just the column header renderer
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("title")}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const task = row.original;
        const description = task.description;

        if (!description) {
          return (
            <span className="text-muted-foreground text-sm">
              No description
            </span>
          );
        }

        return (
          <div className="max-w-[300px]">
            <p className="text-sm truncate">{description}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={"outline"}>{status.replace("_", " ")}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => {
        const task = row.original;
        if (!task.assigned_to?.name) {
          return <span className="text-muted-foreground">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{task.assigned_to?.name}</span>
          </div>
        );
      },
      filterFn: (row, columnId, value) => {
        const task = row.original;
        if (value === "unassigned") {
          return !task.assigned_to;
        }

        return task.assigned_to?.id === Number(value);
      },
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const dueDate = row.getValue("due_date") as string | null;
        if (!dueDate) {
          return <span className="text-muted-foreground">No due date</span>;
        }
        return <span>{new Date(dueDate).toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span>
            {new Date(row.getValue("created_at")).toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data, // this is the data (tasks object) that we populate the rows
    columns, // column definition
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // to include for pagination capability
    getSortedRowModel: getSortedRowModel(), // for column sorting capability
    getFilteredRowModel: getFilteredRowModel(), // for column filtering capability
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    // we pass in the sorting and filter states and state setter
    // it will call it internally
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="pl-9"
          />
        </div>

        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn("assigned_to")?.getFilterValue() as string) ??
            "all"
            // gets current filter value, will default to `all` if no filter is set
          }
          onValueChange={
            (value) =>
              table
                .getColumn("assigned_to")
                ?.setFilterValue(value === "all" ? "" : value)
            // if user selects all from the dropdown, the filter sets to ""
            // else the filter is set to the value
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id.toString()}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null // if the header is not defined in the column def, dont render the header
                        : flexRender(
                            header.column.columnDef.header,
                            // use the header value that we define in the columnDef
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} task(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
