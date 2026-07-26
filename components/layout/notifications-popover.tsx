"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  CalendarClock, 
  Users, 
  Wallet, 
  Sparkles,
  MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useCompanyStore } from "@/store/useCompanyStore";
import { employeesService } from "@/services/employees.service";
import { assignmentsService } from "@/services/assignments.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  icon: typeof Bell;
  type: "warning" | "info" | "success";
  unread: boolean;
}

export function NotificationsPopover() {
  const { activeCompanyId } = useCompanyStore();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Fetch employees for real-time alert calculation
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", activeCompanyId],
    queryFn: () => (activeCompanyId ? employeesService.getEmployees(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
  });

  // Fetch active assignments to detect unassigned workers
  const { data: companyAssignments = [] } = useQuery({
    queryKey: ["assignments", "company-active", activeCompanyId],
    queryFn: () => (activeCompanyId ? assignmentsService.getCompanyActiveAssignments(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
  });

  const assignmentSet = useMemo(() => {
    return new Set(companyAssignments.map((a) => a.employee_id));
  }, [companyAssignments]);

  const unassignedCount = useMemo(() => {
    return employees.filter((e) => !assignmentSet.has(e.id)).length;
  }, [employees, assignmentSet]);

  // Compute dynamic system notifications
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Unassigned Workers Warning
    if (unassignedCount > 0) {
      list.push({
        id: "unassigned-workers",
        title: "Unassigned Workers Detected",
        description: `${unassignedCount} worker${unassignedCount > 1 ? "s" : ""} need deployment to a site.`,
        time: "Action Needed",
        href: "/employees",
        icon: Users,
        type: "warning",
        unread: !readIds.has("unassigned-workers"),
      });
    }

    // 2. Attendance Reminder
    list.push({
      id: "daily-attendance",
      title: "Daily Register Pending",
      description: "Mark and verify today's site attendance records.",
      time: "Today",
      href: "/attendance",
      icon: CalendarClock,
      type: "info",
      unread: !readIds.has("daily-attendance"),
    });

    // 3. Payroll Calculation Alert
    list.push({
      id: "payroll-summary",
      title: "Monthly Payroll Summary",
      description: "Printable payslips and net wage breakdowns ready.",
      time: "2h ago",
      href: "/payroll",
      icon: Wallet,
      type: "success",
      unread: !readIds.has("payroll-summary"),
    });

    // 4. Site Deployment
    list.push({
      id: "site-deployment",
      title: "Active Site Operations",
      description: "Sites and payscale rate sheets active for company.",
      time: "1d ago",
      href: "/sites",
      icon: MapPin,
      type: "info",
      unread: !readIds.has("site-deployment"),
    });

    return list;
  }, [unassignedCount, readIds]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />

      <DropdownMenuContent className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b bg-card">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">Notifications</h4>
            {unreadCount > 0 ? (
              <Badge variant="default" className="text-[10px] h-5 px-1.5 font-bold">
                {unreadCount} new
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                All read
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <DropdownMenuGroup className="max-h-[340px] overflow-y-auto p-1.5 space-y-1">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setReadIds((prev) => new Set([...prev, item.id]))}
                render={
                  <Link
                    href={item.href}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                      item.unread ? "bg-primary/5 dark:bg-primary/10 font-medium" : "hover:bg-muted/50"
                    }`}
                  />
                }
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    item.type === "warning"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : item.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold truncate">{item.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                    {item.description}
                  </p>
                </div>

                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="p-2 text-center bg-muted/20 rounded-b-2xl">
          <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Real-time operational alerts
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
