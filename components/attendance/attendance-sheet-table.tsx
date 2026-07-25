"use client";

import { useState, useMemo } from "react";
import { User, Briefcase, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Employee } from "@/services/employees.service";
import { JobRole } from "@/services/job-roles.service";
import { EmployeeSiteHistory } from "@/services/assignments.service";
import { AttendanceStatus } from "@/services/attendance.service";
import { AttendanceStatusFilter } from "./attendance-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttendanceSheetTableProps {
  employees: Employee[];
  jobRolesMap: Map<string, JobRole>;
  assignmentMap: Map<string, EmployeeSiteHistory>;
  attendanceState: Record<string, AttendanceStatus | undefined>;
  statusFilter: AttendanceStatusFilter;
  onStatusChange: (employeeId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
  searchFilter: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS: { status: AttendanceStatus; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    status: "Present",
    label: "Present",
    activeClass: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    inactiveClass: "hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 border-slate-200 dark:border-slate-800",
  },
  {
    status: "Absent",
    label: "Absent",
    activeClass: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    inactiveClass: "hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-800",
  },
  {
    status: "Half Day",
    label: "Half Day",
    activeClass: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
    inactiveClass: "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 border-slate-200 dark:border-slate-800",
  },
  {
    status: "Leave",
    label: "Leave",
    activeClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    inactiveClass: "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 border-slate-200 dark:border-slate-800",
  },
  {
    status: "Holiday",
    label: "Holiday",
    activeClass: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm",
    inactiveClass: "hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 border-slate-200 dark:border-slate-800",
  },
];

export function AttendanceSheetTable({
  employees,
  jobRolesMap,
  assignmentMap,
  attendanceState,
  statusFilter,
  onStatusChange,
  onMarkAllPresent,
  searchFilter,
  onSearchChange,
  isLoading,
}: AttendanceSheetTableProps) {
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const currentStatus = attendanceState[emp.id]; // undefined if unmarked

      // 1. Filter by Status metric button selection
      if (statusFilter !== "ALL") {
        if (statusFilter === "Unmarked" && currentStatus !== undefined) return false;
        if (statusFilter !== "Unmarked" && currentStatus !== statusFilter) return false;
      }

      // 2. Filter by search input
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = emp.full_name.toLowerCase().includes(query);
        const matchesCode = emp.employee_code.toLowerCase().includes(query);
        const matchesPhone = emp.phone.includes(query);
        if (!matchesName && !matchesCode && !matchesPhone) return false;
      }

      return true;
    });
  }, [employees, attendanceState, statusFilter, searchFilter]);

  const totalRows = filteredEmployees.length;
  const pageCount = Math.ceil(totalRows / pageSize) || 1;

  const paginatedEmployees = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, pageIndex, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Input
          placeholder="Search worker by name, code or phone..."
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllPresent}
          disabled={filteredEmployees.length === 0}
          className="self-start sm:self-auto text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
        >
          <Check className="h-4 w-4 mr-1.5" />
          Mark All Present
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Worker Name</TableHead>
              <TableHead className="hidden md:table-cell">Job Role</TableHead>
              <TableHead className="text-center w-[400px]">Attendance Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Loading attendance records...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No workers match the selected filter ({statusFilter}).
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => {
                const assignment = assignmentMap.get(employee.id);
                const roleObj = assignment ? jobRolesMap.get(assignment.job_role_id) : undefined;
                const roleName = roleObj ? roleObj.name : "General Worker";
                const currentStatus = attendanceState[employee.id]; // undefined if not yet filled

                return (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {employee.employee_code}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-muted p-1.5 rounded-full shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{employee.full_name}</span>
                          <span className="text-xs text-muted-foreground md:hidden flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {roleName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-medium text-xs">
                        {roleName}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        {STATUS_OPTIONS.map((opt) => {
                          const isSelected = currentStatus === opt.status;
                          return (
                            <button
                              key={opt.status}
                              type="button"
                              onClick={() => onStatusChange(employee.id, opt.status)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                                isSelected
                                  ? opt.activeClass
                                  : `bg-background text-muted-foreground ${opt.inactiveClass}`
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground font-medium flex-wrap sm:flex-nowrap">
          <span>
            Showing <strong className="text-foreground font-bold">{totalRows === 0 ? 0 : pageIndex * pageSize + 1}</strong> to{" "}
            <strong className="text-foreground font-bold">{Math.min((pageIndex + 1) * pageSize, totalRows)}</strong> of{" "}
            <strong className="text-foreground font-bold">{totalRows}</strong> entries
          </span>

          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              className="h-8 rounded-xl border border-input/80 bg-background/60 dark:bg-muted/30 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
            >
              {[10, 25, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
            className="gap-1 font-semibold"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>

          <span className="px-3 py-1 bg-muted/60 dark:bg-muted/30 rounded-full font-bold font-mono text-xs text-foreground border border-white/20">
            {pageIndex + 1} / {pageCount}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndex >= pageCount - 1}
            className="gap-1 font-semibold"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

