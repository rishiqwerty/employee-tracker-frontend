"use client";

import { useMemo } from "react";
import { MapPin, Users, IndianRupee, Briefcase, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Site } from "@/services/sites.service";
import { payscalesService, Payscale } from "@/services/payscales.service";
import { jobRolesService, JobRole } from "@/services/job-roles.service";
import { employeesService, Employee } from "@/services/employees.service";
import { assignmentsService, EmployeeSiteHistory } from "@/services/assignments.service";
import { useCompanyStore } from "@/store/useCompanyStore";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SiteDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site | null;
}

export function SiteDetailsDrawer({
  open,
  onOpenChange,
  site,
}: SiteDetailsDrawerProps) {
  const { activeCompanyId } = useCompanyStore();

  // 1. Fetch Payscales for this site
  const { data: payscales = [] } = useQuery({
    queryKey: ["payscales", site?.id],
    queryFn: () => (site ? payscalesService.getActivePayscales(site.id) : Promise.resolve([])),
    enabled: !!site && open,
  });

  // 2. Fetch Job Roles for lookup
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => (activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  const jobRolesMap = useMemo(() => {
    return new Map<string, JobRole>(jobRoles.map((r) => [r.id, r]));
  }, [jobRoles]);

  // 3. Fetch Company Employees
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", activeCompanyId],
    queryFn: () => (activeCompanyId ? employeesService.getEmployees(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  // 4. Fetch Active Assignments
  const { data: companyAssignments = [] } = useQuery({
    queryKey: ["assignments", "company-active", activeCompanyId],
    queryFn: () => (activeCompanyId ? assignmentsService.getCompanyActiveAssignments(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  // Filter crew assigned to this site
  const siteCrew = useMemo(() => {
    if (!site) return [];
    const siteAssignments = companyAssignments.filter((a: EmployeeSiteHistory) => a.site_id === site.id);
    const assignedEmpIds = new Set(siteAssignments.map((a) => a.employee_id));
    const empRoleMap = new Map<string, string>(siteAssignments.map((a) => [a.employee_id, a.job_role_id]));

    return employees
      .filter((emp: Employee) => assignedEmpIds.has(emp.id))
      .map((emp: Employee) => {
        const roleId = empRoleMap.get(emp.id);
        const role = roleId ? jobRolesMap.get(roleId) : undefined;
        return { employee: emp, roleName: role ? role.name : "General Worker" };
      });
  }, [site, companyAssignments, employees, jobRolesMap]);

  if (!site) return null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {site.name}
            </DialogTitle>
            <Badge variant={site.active ? "default" : "secondary"}>
              {site.active ? "Active Site" : "Inactive"}
            </Badge>
          </div>
          <DialogDescription className="text-xs mt-1">
            {site.address ? `${site.address}, ${site.city}` : site.city}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Active Payscales Rules Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-primary" />
              Active Daily Wage Payscale Rules
            </h4>

            <div className="rounded-lg border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground border-b font-semibold">
                  <tr>
                    <th className="p-2.5">Designation / Role</th>
                    <th className="p-2.5 text-right font-bold text-foreground">Daily Wage Rate (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {payscales.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-muted-foreground font-sans">
                        No custom payscale rules configured for this site. (Using default ₹500/day fallback)
                      </td>
                    </tr>
                  ) : (
                    payscales.map((ps: Payscale) => {
                      const role = jobRolesMap.get(ps.job_role_id);
                      return (
                        <tr key={ps.id}>
                          <td className="p-2.5 font-sans font-semibold flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            {role ? role.name : "Worker"}
                          </td>
                          <td className="p-2.5 text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹{formatMoney(Number(ps.daily_wage))} / day
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Crew Roster */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                Deployed Site Crew ({siteCrew.length})
              </span>
            </h4>

            <div className="rounded-lg border divide-y overflow-hidden text-xs">
              {siteCrew.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No workers currently assigned to this site.
                </div>
              ) : (
                siteCrew.map(({ employee, roleName }) => (
                  <div key={employee.id} className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{employee.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Code: {employee.employee_code} • Phone: {employee.phone}
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="bg-muted text-xs font-medium">
                      {roleName}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
