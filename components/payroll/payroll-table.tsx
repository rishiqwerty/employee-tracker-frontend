"use client";

import { useState, useMemo } from "react";
import { User, MapPin, Briefcase, Plus } from "lucide-react";

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

interface PayrollTableProps {
  records: PayrollRecord[];
  searchFilter: string;
  onSearchChange: (val: string) => void;
  isLoading: boolean;
  defaultDate?: string;
}

export function PayrollTable({
  records,
  searchFilter,
  onSearchChange,
  isLoading,
  defaultDate,
}: PayrollTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);

  const handleOpenAddExpense = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setDialogOpen(true);
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
              <TableHead className="text-center w-[130px]">Action</TableHead>
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
              filteredRecords.map((row) => (
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

                  {/* Add Entry Action Button */}
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 font-medium"
                      onClick={() => handleOpenAddExpense(row)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Entry
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Expense / Deduction Dialog */}
      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={selectedRecord}
        defaultDate={defaultDate}
      />
    </div>
  );
}
