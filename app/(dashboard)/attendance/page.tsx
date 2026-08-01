"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save, Calendar, MapPin, Copy, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/utils";

import { useCompanyStore } from "@/store/useCompanyStore";
import { employeesService } from "@/services/employees.service";
import { sitesService, Site } from "@/services/sites.service";
import { jobRolesService, JobRole } from "@/services/job-roles.service";
import { assignmentsService, EmployeeSiteHistory } from "@/services/assignments.service";
import {
  attendanceService,
  AttendanceStatus,
  Attendance,
  BulkAttendanceMarkPayload,
} from "@/services/attendance.service";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceStats, AttendanceStatusFilter } from "@/components/attendance/attendance-stats";
import { AttendanceSheetTable } from "@/components/attendance/attendance-sheet-table";

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSiteId, setSelectedSiteId] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>("ALL");
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus | undefined>>({});

  // Reset selected site & filters when active company changes
  useEffect(() => {
    setSelectedSiteId("ALL");
    setStatusFilter("ALL");
    setSearchFilter("");
  }, [activeCompanyId]);

  // 1. Fetch Company Sites
  const { data: sites = [] } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => (activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  // 2. Fetch Company Job Roles
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => (activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  const jobRolesMap = useMemo(() => {
    return new Map<string, JobRole>(jobRoles.map((r) => [r.id, r]));
  }, [jobRoles]);

  // 3. Fetch Company Employees
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", activeCompanyId],
    queryFn: () => (activeCompanyId ? employeesService.getEmployees(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  // 4. Fetch Active Assignments for Company
  const { data: companyAssignments = [] } = useQuery({
    queryKey: ["assignments", "company-active", activeCompanyId],
    queryFn: () => (activeCompanyId ? assignmentsService.getCompanyActiveAssignments(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  const assignmentMap = useMemo(() => {
    return new Map<string, EmployeeSiteHistory>(
      companyAssignments.map((a) => [a.employee_id, a])
    );
  }, [companyAssignments]);

  // Filter employees by selected site (if specific site chosen)
  const siteEmployees = useMemo(() => {
    if (selectedSiteId === "ALL") return employees;
    return employees.filter((emp) => {
      const ass = assignmentMap.get(emp.id);
      return ass?.site_id === selectedSiteId;
    });
  }, [employees, selectedSiteId, assignmentMap]);

  // 5. Fetch existing attendance for the selected site and date
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", activeCompanyId, selectedSiteId, selectedDate, sites.map(s => s.id).join(",")],
    queryFn: async () => {
      if (selectedSiteId === "ALL") {
        if (sites.length === 0) return [];
        // Fetch attendance for all sites for that date
        const allRecords = await Promise.all(
          sites.map((s) => attendanceService.getSiteAttendance(s.id, selectedDate))
        );
        return allRecords.flat();
      }
      return attendanceService.getSiteAttendance(selectedSiteId, selectedDate);
    },
    enabled: !!activeCompanyId && !!selectedDate && (selectedSiteId !== "ALL" || sites.length > 0),
    placeholderData: (previousData) => previousData,
  });

  const existingAttendanceKey = useMemo(() => {
    return existingAttendance.map((a) => `${a.employee_id}:${a.status}`).join(",");
  }, [existingAttendance]);

  // Populate local attendance state when existing attendance data changes
  useEffect(() => {
    const initialState: Record<string, AttendanceStatus | undefined> = {};
    
    // Keep unselected if not yet recorded in the database!
    existingAttendance.forEach((record) => {
      initialState[record.employee_id] = record.status;
    });

    setAttendanceState(initialState);
  }, [existingAttendanceKey]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const isToday = selectedDate === todayStr;

  // Calculate if there are unsaved attendance edits
  const hasUnsavedChanges = useMemo(() => {
    if (isLoadingAttendance) return false;
    const savedMap = new Map<string, AttendanceStatus>();
    existingAttendance.forEach((record) => {
      savedMap.set(record.employee_id, record.status);
    });

    for (const emp of siteEmployees) {
      const currentStatus = attendanceState[emp.id];
      const savedStatus = savedMap.get(emp.id);
      if (currentStatus !== savedStatus) {
        return true;
      }
    }
    return false;
  }, [existingAttendance, attendanceState, siteEmployees, isLoadingAttendance]);

  // Warn user before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Status counts for summary stats
  const statusCounts = useMemo(() => {
    const counts: Record<AttendanceStatus | "Unmarked", number> = {
      Present: 0,
      Absent: 0,
      "Half Day": 0,
      Leave: 0,
      Holiday: 0,
      Unmarked: 0,
    };
    siteEmployees.forEach((emp) => {
      const status = attendanceState[emp.id];
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
      } else {
        counts.Unmarked += 1;
      }
    });
    return counts;
  }, [siteEmployees, attendanceState]);

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [employeeId]: prev[employeeId] === status ? undefined : status, // Toggle off if clicked again!
    }));
  };

  const handleMarkAllPresent = () => {
    const nextState = { ...attendanceState };
    siteEmployees.forEach((emp) => {
      nextState[emp.id] = "Present";
    });
    setAttendanceState(nextState);
    toast.info("Marked all workers as Present");
  };

  const handleCopyPreviousDay = async () => {
    try {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      const yesterdayStr = prev.toISOString().split("T")[0];

      let yesterdayRecords: Attendance[] = [];
      if (selectedSiteId === "ALL") {
        if (sites.length > 0) {
          const sitePromises = sites.map((s) => attendanceService.getSiteAttendance(s.id, yesterdayStr));
          const dateResults = await Promise.all(sitePromises);
          yesterdayRecords = dateResults.flat();
        }
      } else {
        yesterdayRecords = await attendanceService.getSiteAttendance(selectedSiteId, yesterdayStr);
      }

      if (yesterdayRecords.length === 0) {
        toast.warning(`No attendance records found for yesterday (${yesterdayStr})`);
        return;
      }

      const nextState = { ...attendanceState };
      let copiedCount = 0;

      yesterdayRecords.forEach((record) => {
        if (record.status) {
          nextState[record.employee_id] = record.status;
          copiedCount++;
        }
      });

      setAttendanceState(nextState);
      toast.success(`Copied ${copiedCount} worker records from yesterday (${yesterdayStr})`);
    } catch {
      toast.error("Failed to copy previous day attendance");
    }
  };

  const handleDateChange = (offsetDays: number) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + offsetDays);
    const nextDate = curr.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    if (nextDate > today) {
      toast.warning("Cannot mark attendance for future dates");
      return;
    }
    setSelectedDate(nextDate);
  };

  // Bulk Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (siteEmployees.length === 0) throw new Error("No workers to record attendance for");

      // Group records by site_id
      const siteGroupedPayloads: Record<string, { employee_id: string; status: AttendanceStatus }[]> = {};

      let hasSelectedRecords = false;

      siteEmployees.forEach((emp) => {
        const status = attendanceState[emp.id];
        if (!status) return; // Skip workers without an explicitly marked status!

        hasSelectedRecords = true;

        const ass = assignmentMap.get(emp.id);
        const targetSiteId = ass?.site_id || (sites.length > 0 ? sites[0].id : null);
        if (!targetSiteId) return;

        if (!siteGroupedPayloads[targetSiteId]) {
          siteGroupedPayloads[targetSiteId] = [];
        }
        siteGroupedPayloads[targetSiteId].push({
          employee_id: emp.id,
          status,
        });
      });

      if (!hasSelectedRecords) {
        throw new Error("Please select attendance for at least one worker before saving.");
      }

      // Submit bulk payloads per site
      const promises = Object.entries(siteGroupedPayloads).map(([siteId, records]) => {
        const payload: BulkAttendanceMarkPayload = {
          date: selectedDate,
          site_id: siteId,
          records,
        };
        return attendanceService.bulkMarkAttendance(payload);
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Attendance saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: unknown) => {
      toast.error(formatErrorMessage(error, "Failed to save attendance"));
    },
  });

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Selected</h2>
          <p className="text-muted-foreground">
            Please select a company from the top navigation bar to view and mark daily attendance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mark and track daily worker attendance by site and date.
          </p>
        </div>

        {/* Date & Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Site Selector */}
          <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 shadow-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sites ({sites.length})</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Quick Nav */}
          <div className="flex items-center gap-1 bg-card border rounded-lg p-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateChange(1)}
              disabled={selectedDate >= new Date().toISOString().split("T")[0]}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Copy Yesterday's Attendance Helper */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPreviousDay}
            className="text-xs font-semibold gap-1.5"
            title="Copy attendance entries from yesterday"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Yesterday
          </Button>

          {/* Save Attendance Primary Action */}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || siteEmployees.length === 0}
            className="bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saveMutation.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {/* ── 1. Unsaved Changes Warning Banner ── */}
      {hasUnsavedChanges && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                Unsaved Attendance Changes
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300 text-[10px]">
                  Action Required
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have updated worker attendance records. Click &quot;Save Attendance&quot; to save your changes.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md gap-1.5 shrink-0"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Attendance Now"}
          </Button>
        </div>
      )}

      {/* ── 2. Today's Unmarked Attendance Warning Banner ── */}
      {isToday && statusCounts.Unmarked > 0 && !hasUnsavedChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Today&apos;s Attendance Pending ({todayStr})</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {statusCounts.Unmarked} {statusCounts.Unmarked === 1 ? "worker has" : "workers have"} not been marked for today yet.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-xs font-semibold rounded-xl shrink-0 gap-1.5"
          >
            Quick Mark All Present
          </Button>
        </div>
      )}

      {/* Daily Summary Stats & Metric Filter Buttons */}
      <AttendanceStats
        totalEmployees={siteEmployees.length}
        statusCounts={statusCounts}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Attendance Register Sheet Table */}
      <AttendanceSheetTable
        employees={siteEmployees}
        jobRolesMap={jobRolesMap}
        assignmentMap={assignmentMap}
        attendanceState={attendanceState}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onMarkAllPresent={handleMarkAllPresent}
        searchFilter={searchFilter}
        onSearchChange={setSearchFilter}
        isLoading={isLoadingEmployees || isLoadingAttendance}
      />
    </div>
  );
}
