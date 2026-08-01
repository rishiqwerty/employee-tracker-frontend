"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  MapPin, 
  CalendarClock, 
  Wallet, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  Building2,
  TrendingUp,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useCompanyStore } from "@/store/useCompanyStore";
import { employeesService } from "@/services/employees.service";
import { sitesService } from "@/services/sites.service";
import { assignmentsService, EmployeeSiteHistory } from "@/services/assignments.service";
import { attendanceService, Attendance } from "@/services/attendance.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // 1. Fetch Company Sites
  const { data: sites = [], isLoading: isLoadingSites } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => (activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  // 2. Fetch Company Employees
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", activeCompanyId],
    queryFn: () => (activeCompanyId ? employeesService.getEmployees(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  // 3. Fetch Active Assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", "company-active", activeCompanyId],
    queryFn: () => (activeCompanyId ? assignmentsService.getCompanyActiveAssignments(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  // 4. Fetch Today's Attendance Across All Sites
  const { data: todayAttendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["today-attendance", activeCompanyId, todayStr, sites.map((s) => s.id).join(",")],
    queryFn: async () => {
      if (sites.length === 0) return [];
      const sitePromises = sites.map((s) => attendanceService.getSiteAttendance(s.id, todayStr));
      const dateResults = await Promise.all(sitePromises);
      return dateResults.flat();
    },
    enabled: !!activeCompanyId && sites.length > 0,
    placeholderData: (previousData) => previousData,
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalWorkers = employees.length;
    const activeSitesCount = sites.filter((s) => s.active).length;

    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;

    todayAttendance.forEach((att: Attendance) => {
      if (att.status === "Present") presentCount++;
      else if (att.status === "Half Day") halfDayCount++;
      else if (att.status === "Absent") absentCount++;
    });

    const totalMarked = todayAttendance.length;
    const unmarkedCount = Math.max(0, totalWorkers - totalMarked);
    const attendancePercentage = totalWorkers > 0 ? Math.round((presentCount / totalWorkers) * 100) : 0;

    return {
      totalWorkers,
      activeSitesCount,
      presentCount,
      halfDayCount,
      absentCount,
      unmarkedCount,
      attendancePercentage,
    };
  }, [employees, sites, todayAttendance]);

  // Calculate Site Deployment Breakdown
  const siteDeployments = useMemo(() => {
    const counts = new Map<string, number>();
    assignments.forEach((a: EmployeeSiteHistory) => {
      counts.set(a.site_id, (counts.get(a.site_id) || 0) + 1);
    });

    return sites.map((site) => {
      const count = counts.get(site.id) || 0;
      const percentage = metrics.totalWorkers > 0 ? Math.round((count / metrics.totalWorkers) * 100) : 0;
      return { site, count, percentage };
    });
  }, [sites, assignments, metrics.totalWorkers]);

  const isLoading = isLoadingSites || isLoadingEmployees || isLoadingAttendance;

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-semibold mb-2">No Active Company Selected</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please select or create a company using the top dropdown menu to view operational metrics and live workforce stats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border">
        <div>
          <Badge className="mb-2 bg-primary/20 text-primary border-none hover:bg-primary/20">
            Workforce Command Center
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of workforce attendance, site deployments, and payroll operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.href = "/attendance"} className="gap-2 shadow-sm">
            <CalendarClock className="h-4 w-4" />
            Mark Attendance
          </Button>
          <Button onClick={() => window.location.href = "/payroll"} variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            Payroll Summary
          </Button>
        </div>
      </div>

      {/* Unmarked Attendance Warning Banner */}
      {!isLoading && metrics.unmarkedCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Attendance Pending for Today ({todayStr})</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metrics.unmarkedCount} out of {metrics.totalWorkers} workers have not been marked for today&apos;s shift yet.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = "/attendance"}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs shrink-0 gap-1.5"
          >
            <CalendarClock className="h-4 w-4" />
            Mark Today&apos;s Attendance
          </Button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Workers */}
        <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Workforce</CardTitle>
            <div className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{isLoading ? "..." : metrics.totalWorkers}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <UserCheck className="h-3 w-3 text-emerald-500" /> Active employees registered
            </p>
          </CardContent>
        </Card>

        {/* Active Sites */}
        <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Work Sites</CardTitle>
            <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 p-2 rounded-lg">
              <MapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{isLoading ? "..." : metrics.activeSitesCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Projects under active deployment
            </p>
          </CardContent>
        </Card>

        {/* Today's Attendance Rate */}
        <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Today's Present Rate</CardTitle>
            <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold">{isLoading ? "..." : `${metrics.attendancePercentage}%`}</div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ({metrics.presentCount} Present)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Date: {todayStr}
            </p>
          </CardContent>
        </Card>

        {/* Unmarked Attendance Alert */}
        <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Unmarked Today</CardTitle>
            <div className="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 p-2 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {isLoading ? "..." : metrics.unmarkedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {metrics.unmarkedCount > 0 ? "Awaiting supervisor entry" : "All attendance recorded!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Columns: Site Deployment Distribution */}
        <Card className="md:col-span-2 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Site Workforce Distribution</span>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/sites"} className="text-xs gap-1">
                Manage Sites <ArrowRight className="h-3 w-3" />
              </Button>
            </CardTitle>
            <CardDescription>
              Worker allocation across construction sites and project locations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading site allocation...</div>
            ) : siteDeployments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No sites registered yet. Create a site to allocate employees.
              </div>
            ) : (
              siteDeployments.map(({ site, count, percentage }) => (
                <div key={site.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold">{site.name}</span>
                      <span className="text-xs text-muted-foreground">({site.city})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">{count} workers</span>
                      <Badge variant="secondary" className="text-[11px]">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right 1 Column: Quick Operations Panel */}
        <Card className="shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Quick Operations</CardTitle>
            <CardDescription>Direct navigation shortcuts for daily management.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/attendance"
              className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-accent transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Attendance Register</div>
                  <div className="text-xs text-muted-foreground">Mark daily crew presence</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/employees"
              className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-accent transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Workforce Roster</div>
                  <div className="text-xs text-muted-foreground">Manage & deploy staff</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/payroll"
              className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-accent transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 p-2 rounded-lg">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Payroll & Expenses</div>
                  <div className="text-xs text-muted-foreground">Wage calculations & payslips</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
