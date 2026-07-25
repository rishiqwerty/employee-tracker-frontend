"use client";

import { Users, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { AttendanceStatus } from "@/services/attendance.service";

export type AttendanceStatusFilter = "ALL" | AttendanceStatus | "Unmarked";

interface AttendanceStatsProps {
  totalEmployees: number;
  statusCounts: Record<AttendanceStatus | "Unmarked", number>;
  selectedFilter: AttendanceStatusFilter;
  onFilterChange: (filter: AttendanceStatusFilter) => void;
}

export function AttendanceStats({
  totalEmployees,
  statusCounts,
  selectedFilter,
  onFilterChange,
}: AttendanceStatsProps) {
  const stats: {
    filter: AttendanceStatusFilter;
    label: string;
    value: number;
    icon: typeof Users;
    color: string;
    activeBorder: string;
  }[] = [
    {
      filter: "ALL",
      label: "Total Workers",
      value: totalEmployees,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
      activeBorder: "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30",
    },
    {
      filter: "Present",
      label: "Present",
      value: statusCounts["Present"] || 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
      activeBorder: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30",
    },
    {
      filter: "Absent",
      label: "Absent",
      value: statusCounts["Absent"] || 0,
      icon: XCircle,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
      activeBorder: "ring-2 ring-rose-500 border-rose-500 bg-rose-50/50 dark:bg-rose-950/30",
    },
    {
      filter: "Half Day",
      label: "Half Day",
      value: statusCounts["Half Day"] || 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
      activeBorder: "ring-2 ring-amber-500 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30",
    },
    {
      filter: "Unmarked",
      label: "Unmarked",
      value: statusCounts["Unmarked"] || 0,
      icon: AlertCircle,
      color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
      activeBorder: "ring-2 ring-slate-500 border-slate-500 bg-slate-100/80 dark:bg-slate-800/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = selectedFilter === stat.filter;

        return (
          <button
            key={stat.filter}
            type="button"
            onClick={() => onFilterChange(stat.filter)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
              isActive
                ? stat.activeBorder
                : "bg-card text-card-foreground hover:bg-accent/40 shadow-sm"
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">{stat.label}</p>
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
