"use client";

import { useState, useMemo } from "react";
import { Calendar, MapPin, Download, Printer } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCompanyStore } from "@/store/useCompanyStore";
import { sitesService } from "@/services/sites.service";
import { advancesService } from "@/services/advances.service";
import { deductionsService } from "@/services/deductions.service";
import { payrollService } from "@/services/payroll.service";

import { Button } from "@/components/ui/button";
import { PayrollSummaryCards } from "@/components/payroll/payroll-summary-cards";
import { PayrollTable } from "@/components/payroll/payroll-table";

type DateFilterMode = "MONTH" | "RANGE";

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyStore();

  const getCurrentMonthStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const getFirstDayOfMonthStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  };

  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("MONTH");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [fromDate, setFromDate] = useState<string>(getFirstDayOfMonthStr());
  const [toDate, setToDate] = useState<string>(getTodayStr());

  const [selectedSiteId, setSelectedSiteId] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // 1. Fetch Company Sites
  const { data: sites = [] } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => (activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId,
  });

  // Calculate start date & end date strings
  const { startDateStr, endDateStr } = useMemo(() => {
    let startStr = "";
    let endStr = "";

    if (dateFilterMode === "MONTH") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      startStr = `${year}-${String(month).padStart(2, "0")}-01`;
      endStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    } else {
      startStr = fromDate;
      endStr = toDate;
    }
    return { startDateStr: startStr, endDateStr: endStr };
  }, [dateFilterMode, selectedMonth, fromDate, toDate]);

  // 2. Fetch High-Performance Server-Side Calculated Payroll Summary
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payroll-summary", activeCompanyId, startDateStr, endDateStr, selectedSiteId],
    queryFn: () =>
      activeCompanyId && startDateStr && endDateStr
        ? payrollService.getCompanyPayrollSummary(activeCompanyId, startDateStr, endDateStr, selectedSiteId)
        : Promise.resolve(null),
    enabled: !!activeCompanyId && !!startDateStr && !!endDateStr,
  });

  const totals = useMemo(() => {
    if (!payrollData?.summary) {
      return { totalGross: 0, totalAdvances: 0, totalUniforms: 0, totalNet: 0 };
    }
    return {
      totalGross: Number(payrollData.summary.total_gross),
      totalAdvances: Number(payrollData.summary.total_advances),
      totalUniforms: Number(payrollData.summary.total_uniforms),
      totalNet: Number(payrollData.summary.total_net),
    };
  }, [payrollData]);

  const records = useMemo(() => {
    return payrollData?.records || [];
  }, [payrollData]);

  // Save Advance Mutation
  const saveAdvanceMutation = useMutation({
    mutationFn: (data: { employee_id: string; amount: number }) => {
      return advancesService.createAdvance({
        employee_id: data.employee_id,
        amount: data.amount,
        advance_date: endDateStr || getTodayStr(),
        notes: `Payroll deduction for period ${startDateStr} to ${endDateStr}`,
      });
    },
    onSuccess: () => {
      toast.success("Advance recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
    },
  });

  // Save Deduction Mutation
  const saveDeductionMutation = useMutation({
    mutationFn: (data: { employee_id: string; amount: number }) => {
      return deductionsService.createDeduction({
        employee_id: data.employee_id,
        deduction_type: "UNIFORM",
        amount: data.amount,
        deduction_date: endDateStr || getTodayStr(),
        notes: `Uniform deduction for period ${startDateStr} to ${endDateStr}`,
      });
    },
    onSuccess: () => {
      toast.success("Uniform deduction recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
    },
  });

  const handleDeductionChange = (
    employeeId: string,
    field: "advance" | "uniform",
    val: number
  ) => {
    if (field === "advance") {
      saveAdvanceMutation.mutate({ employee_id: employeeId, amount: val });
    } else {
      saveDeductionMutation.mutate({ employee_id: employeeId, amount: val });
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.warning("No payroll records to export");
      return;
    }

    const headers = [
      "Employee Code",
      "Full Name",
      "Site",
      "Designation",
      "Present Days",
      "Half Days",
      "Paid Days",
      "Daily Wage (INR)",
      "Gross Salary (INR)",
      "Advance (INR)",
      "Uniform Deduction (INR)",
      "Total Deductions (INR)",
      "Net Payable (INR)",
    ];

    const csvRows = records.map((r) => [
      `"${r.employee_code}"`,
      `"${r.full_name}"`,
      `"${r.site_name}"`,
      `"${r.job_role_name}"`,
      r.present_days,
      r.half_days,
      r.paid_days,
      r.daily_wage,
      r.gross_salary,
      r.advance_amount,
      r.uniform_deduction,
      r.total_deductions,
      r.net_salary,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_${startDateStr}_${endDateStr}_${selectedSiteId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Payroll CSV exported successfully");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Payroll & Calculations</h1>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Selected</h2>
          <p className="text-muted-foreground">
            Please select a company from the top navigation bar to view and compute payroll.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll & Calculations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Server-calculated workforce wages based on attendance, advances, and uniform deductions.
          </p>
        </div>

        {/* Date & Site Filter Controls */}
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

          {/* Date Filter Mode Selector */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setDateFilterMode("MONTH")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                dateFilterMode === "MONTH"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Month
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode("RANGE")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                dateFilterMode === "RANGE"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Month or Date Range Pickers */}
          {dateFilterMode === "MONTH" ? (
            <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 shadow-sm">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              />
              <span className="text-muted-foreground">To:</span>
              <input
                type="date"
                value={toDate}
                max={getTodayStr()}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <PayrollSummaryCards
        totalGross={totals.totalGross}
        totalAdvances={totals.totalAdvances}
        totalUniforms={totals.totalUniforms}
        totalNet={totals.totalNet}
      />

      {/* Interactive Payroll Sheet Table */}
      <PayrollTable
        records={records}
        searchFilter={searchFilter}
        onSearchChange={setSearchFilter}
        isLoading={isLoading}
        defaultDate={endDateStr}
      />
    </div>
  );
}
