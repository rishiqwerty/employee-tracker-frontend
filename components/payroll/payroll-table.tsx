"use client";

import { useState, useMemo } from "react";
import { User, MapPin, Briefcase, Plus, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { PayrollRecord } from "@/services/payroll.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddExpenseDialog } from "./add-expense-dialog";
import { PayslipModal } from "./payslip-modal";

interface PayrollTableProps {
  records: PayrollRecord[];
  searchFilter: string;
  onSearchChange: (val: string) => void;
  isLoading: boolean;
  defaultDate?: string;
  companyName?: string;
}

export function PayrollTable({
  records,
  searchFilter,
  onSearchChange,
  isLoading,
  defaultDate,
  companyName = "",
}: PayrollTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const [payslipRecord, setPayslipRecord] = useState<PayrollRecord | null>(null);
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);

  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const filteredRecords = useMemo(() => {
    if (!searchFilter.trim()) return records;
    const query = searchFilter.toLowerCase();
    return records.filter(
      (r) =>
        r.full_name.toLowerCase().includes(query) ||
        r.employee_code.toLowerCase().includes(query) ||
        r.site_name.toLowerCase().includes(query) ||
        r.job_role_name.toLowerCase().includes(query)
    );
  }, [records, searchFilter]);

  const totalRows = filteredRecords.length;
  const pageCount = Math.ceil(totalRows / pageSize) || 1;

  const paginatedRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, pageIndex, pageSize]);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);

  const handleOpenAddExpense = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setExpenseDialogOpen(true);
  };

  const handleOpenPayslip = (record: PayrollRecord) => {
    setPayslipRecord(record);
    setPayslipDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search worker by name, code or site..."
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          Showing {filteredRecords.length} workers
        </span>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Code</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Site / Designation</TableHead>
              <TableHead className="text-center">Present</TableHead>
              <TableHead className="text-center">Half Day</TableHead>
              <TableHead className="text-center font-bold">Paid Days</TableHead>
              <TableHead className="text-right">Daily Rate</TableHead>
              <TableHead className="text-right font-bold">Gross Wage</TableHead>
              <TableHead className="text-right font-semibold text-amber-600 dark:text-amber-400">
                Advance (₹)
              </TableHead>
              <TableHead className="text-right font-semibold text-purple-600 dark:text-purple-400">
                Uniform (₹)
              </TableHead>
              <TableHead className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                Net Pay (₹)
              </TableHead>
              <TableHead className="text-center w-[160px]">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                  Calculating payroll from attendance records...
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                  No payroll records found for the selected month/filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((row) => (
                <TableRow key={row.employee_id} className="hover:bg-muted/50">
                  {/* Code */}
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    {row.employee_code}
                  </TableCell>

                  {/* Worker Name */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="bg-muted p-1.5 rounded-full shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-sm truncate max-w-[140px]">
                        {row.full_name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Site & Designation */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-center gap-1 font-medium truncate max-w-[130px]" title={row.site_name}>
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        {row.site_name}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-[11px] truncate max-w-[130px]">
                        <Briefcase className="h-3 w-3 shrink-0" />
                        {row.job_role_name}
                      </div>
                    </div>
                  </TableCell>

                  {/* Present Days */}
                  <TableCell className="text-center font-medium">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {row.present_days}
                    </Badge>
                  </TableCell>

                  {/* Half Days */}
                  <TableCell className="text-center font-medium">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                      {row.half_days}
                    </Badge>
                  </TableCell>

                  {/* Effective Paid Days */}
                  <TableCell className="text-center font-bold text-sm">
                    {row.paid_days}
                  </TableCell>

                  {/* Daily Wage */}
                  <TableCell className="text-right font-mono text-xs">
                    ₹{formatMoney(row.daily_wage)}
                  </TableCell>

                  {/* Gross Wage */}
                  <TableCell className="text-right font-bold text-sm font-mono">
                    ₹{formatMoney(row.gross_salary)}
                  </TableCell>

                  {/* Tracked Advance */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {row.advance_amount > 0 ? `₹${formatMoney(row.advance_amount)}` : "-"}
                  </TableCell>

                  {/* Tracked Uniform Deduction */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {row.uniform_deduction > 0 ? `₹${formatMoney(row.uniform_deduction)}` : "-"}
                  </TableCell>

                  {/* Net Payable */}
                  <TableCell className="text-right">
                    {row.net_salary < 0 ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-mono font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900">
                        -₹{formatMoney(Math.abs(row.net_salary))}
                      </span>
                    ) : (
                      <span className="font-bold text-base font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{formatMoney(row.net_salary)}
                      </span>
                    )}
                  </TableCell>

                  {/* Action Buttons: Add Entry & View Payslip */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1 font-medium px-2"
                        onClick={() => handleOpenAddExpense(row)}
                        title="Add Advance or Uniform Entry"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Entry
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 font-medium px-2 text-primary"
                        onClick={() => handleOpenPayslip(row)}
                        title="Generate Official Payslip"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Payslip
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer Controls */}
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

      {/* Add Expense / Deduction Dialog */}
      <AddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        record={selectedRecord}
        defaultDate={defaultDate}
      />

      {/* Official Salary Slip Modal */}
      <PayslipModal
        open={payslipDialogOpen}
        onOpenChange={setPayslipDialogOpen}
        record={payslipRecord}
        companyName={companyName}
        periodLabel={defaultDate || "Current Period"}
      />
    </div>
  );
}
