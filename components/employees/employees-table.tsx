"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, User, MapPin, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Employee } from "@/services/employees.service";
import { sitesService, Site } from "@/services/sites.service";
import { jobRolesService, JobRole } from "@/services/job-roles.service";
import { assignmentsService, EmployeeSiteHistory } from "@/services/assignments.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeDialog } from "./employee-dialog";
import { AssignSiteDialog } from "./assign-site-dialog";
import { useCompanyStore } from "@/store/useCompanyStore";

interface EmployeesTableProps {
  data: Employee[];
  isLoading: boolean;
}

interface TableMetaType {
  sitesMap: Map<string, Site>;
  jobRolesMap: Map<string, JobRole>;
  assignmentMap: Map<string, EmployeeSiteHistory>;
  setEditingEmployee: (emp: Employee) => void;
  setDialogOpen: (open: boolean) => void;
  setAssigningEmployee: (emp: Employee) => void;
  setAssignDialogOpen: (open: boolean) => void;
}

export function EmployeesTable({ data, isLoading }: EmployeesTableProps) {
  const { activeCompanyId } = useCompanyStore();

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [assigningEmployee, setAssigningEmployee] = useState<Employee | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>("ALL");
  const [selectedJobRoleFilter, setSelectedJobRoleFilter] = useState<string>("ALL");

  // Fetch company sites for filtering and name lookup
  const { data: sites = [] } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId,
  });

  const sitesMap = useMemo(() => {
    return new Map<string, Site>(sites.map((s) => [s.id, s]));
  }, [sites]);

  // Fetch company job roles for filtering and name lookup
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId,
  });

  const jobRolesMap = useMemo(() => {
    return new Map<string, JobRole>(jobRoles.map((r) => [r.id, r]));
  }, [jobRoles]);

  // Fetch all active assignments for the company in 1 single bulk API request
  const { data: companyAssignments = [] } = useQuery({
    queryKey: ["assignments", "company-active", activeCompanyId],
    queryFn: () => activeCompanyId ? assignmentsService.getCompanyActiveAssignments(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId,
  });

  // Fast O(1) map for employee -> active assignment lookup
  const assignmentMap = useMemo(() => {
    return new Map<string, EmployeeSiteHistory>(
      companyAssignments.map((a) => [a.employee_id, a])
    );
  }, [companyAssignments]);

  // Apply Site and Job Role Filters to employees data
  const filteredData = useMemo(() => {
    return data.filter((emp) => {
      const assignment = assignmentMap.get(emp.id);

      // 1. Site Filter
      if (selectedSiteFilter !== "ALL") {
        if (selectedSiteFilter === "UNASSIGNED" && assignment) return false;
        if (selectedSiteFilter !== "UNASSIGNED" && assignment?.site_id !== selectedSiteFilter) return false;
      }

      // 2. Job Role Filter
      if (selectedJobRoleFilter !== "ALL") {
        if (assignment?.job_role_id !== selectedJobRoleFilter) return false;
      }

      return true;
    });
  }, [data, selectedSiteFilter, selectedJobRoleFilter, assignmentMap]);

  // Static columns definition (never re-instantiated, using meta for dynamic lookups)
  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: "employee_code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("employee_code")}</span>,
    },
    {
      accessorKey: "full_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <div className="bg-muted p-1.5 rounded-full">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          {row.getValue("full_name")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "site",
      header: "Site / Deployment",
      cell: ({ row, table }) => {
        const meta = table.options.meta as TableMetaType;
        const assignment = meta.assignmentMap.get(row.original.id);

        if (!assignment) {
          return (
            <Badge variant="outline" className="text-muted-foreground font-normal border-dashed">
              Unassigned
            </Badge>
          );
        }

        const site = meta.sitesMap.get(assignment.site_id);
        const siteName = site ? site.name : "Assigned Site";
        const roleObj = meta.jobRolesMap.get(assignment.job_role_id);
        const roleName = roleObj ? roleObj.name : undefined;

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 font-medium text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[140px]" title={siteName}>
                {siteName}
              </span>
            </div>
            {roleName && (
              <span className="text-[10px] text-muted-foreground pl-5 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-muted-foreground inline" />
                {roleName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "joining_date",
      header: "Joined",
      cell: ({ row }) => {
        const val = row.getValue("joining_date") as string;
        return val ? new Date(val).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const meta = table.options.meta as TableMetaType;
        const employee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    meta.setEditingEmployee(employee);
                    meta.setDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Employee
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    meta.setAssigningEmployee(employee);
                    meta.setAssignDialogOpen(true);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  Assign / Transfer Site
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const tableMeta: TableMetaType = useMemo(() => ({
    sitesMap,
    jobRolesMap,
    assignmentMap,
    setEditingEmployee,
    setDialogOpen,
    setAssigningEmployee,
    setAssignDialogOpen,
  }), [sitesMap, jobRolesMap, assignmentMap]);

  const table = useReactTable({
    data: filteredData,
    columns,
    meta: tableMeta,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
          <Input
            placeholder="Search employees..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />

          {/* Site Filter Dropdown */}
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-[180px]"
          >
            <option value="ALL">All Sites</option>
            <option value="UNASSIGNED">Unassigned</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Job Role Filter Dropdown */}
          <select
            value={selectedJobRoleFilter}
            onChange={(e) => setSelectedJobRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-[180px]"
          >
            <option value="ALL">All Job Roles</option>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
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

      <EmployeeDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setTimeout(() => setEditingEmployee(null), 200);
        }} 
        employee={editingEmployee} 
      />

      <AssignSiteDialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) setTimeout(() => setAssigningEmployee(null), 200);
        }}
        employee={assigningEmployee}
        currentSiteId={assigningEmployee ? assignmentMap.get(assigningEmployee.id)?.site_id : undefined}
        currentJobRoleId={assigningEmployee ? assignmentMap.get(assigningEmployee.id)?.job_role_id : undefined}
      />
    </div>
  );
}
