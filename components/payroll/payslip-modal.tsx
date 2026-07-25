"use client";

import { useRef } from "react";
import { Printer, Download, Building2, User, Calendar, MapPin, Briefcase } from "lucide-react";
import { PayrollRecord } from "@/services/payroll.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PayslipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PayrollRecord | null;
  companyName: string;
  periodLabel: string;
}

export function PayslipModal({
  open,
  onOpenChange,
  record,
  companyName,
  periodLabel,
}: PayslipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle className="text-xl font-bold">Official Salary Payslip</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Workforce Earnings & Deduction Receipt
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 print:hidden">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </DialogHeader>

        {/* Printable Payslip Sheet Document */}
        <div ref={printRef} className="space-y-6 pt-2 text-foreground">
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Building2 className="h-5 w-5" />
                <span>{companyName || "Construction & Workforce Inc."}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Official Monthly Workforce Payroll Slip
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pay Period
              </div>
              <div className="font-semibold text-sm">{periodLabel}</div>
            </div>
          </div>

          {/* Employee & Site Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl text-xs border">
            <div>
              <span className="text-muted-foreground font-medium block">Worker Name:</span>
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-primary" />
                {record.full_name} ({record.employee_code})
              </span>
            </div>

            <div>
              <span className="text-muted-foreground font-medium block">Contact Number:</span>
              <span className="font-semibold text-foreground block mt-0.5">{record.phone}</span>
            </div>

            <div>
              <span className="text-muted-foreground font-medium block">Assigned Site:</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {record.site_name}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground font-medium block">Designation / Role:</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {record.job_role_name}
              </span>
            </div>
          </div>

          {/* Worked Days & Wage Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Attendance & Wage Computation
            </h4>
            <div className="rounded-lg border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground border-b font-semibold">
                  <tr>
                    <th className="p-2.5">Present Days</th>
                    <th className="p-2.5 text-center">Half Days</th>
                    <th className="p-2.5 text-center font-bold text-foreground">Paid Days</th>
                    <th className="p-2.5 text-right">Daily Rate</th>
                    <th className="p-2.5 text-right font-bold text-foreground">Gross Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  <tr>
                    <td className="p-2.5 font-sans font-medium">{record.present_days} Days</td>
                    <td className="p-2.5 text-center font-sans font-medium">{record.half_days} Days</td>
                    <td className="p-2.5 text-center font-bold text-sm">{record.paid_days}</td>
                    <td className="p-2.5 text-right">₹{formatMoney(record.daily_wage)}</td>
                    <td className="p-2.5 text-right font-bold text-sm">₹{formatMoney(record.gross_salary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Itemization Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tracked Deductions & Advances
            </h4>
            <div className="rounded-lg border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground border-b font-semibold">
                  <tr>
                    <th className="p-2.5">Deduction Type</th>
                    <th className="p-2.5 text-right font-bold text-foreground">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  <tr>
                    <td className="p-2.5 font-sans">Financial Advances Issued</td>
                    <td className="p-2.5 text-right text-amber-600 dark:text-amber-400 font-semibold">
                      ₹{formatMoney(record.advance_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Uniform / Kit Deductions</td>
                    <td className="p-2.5 text-right text-purple-600 dark:text-purple-400 font-semibold">
                      ₹{formatMoney(record.uniform_deduction)}
                    </td>
                  </tr>
                  <tr className="bg-muted/30 font-bold font-sans">
                    <td className="p-2.5">Total Deductions</td>
                    <td className="p-2.5 text-right font-mono text-sm">
                      ₹{formatMoney(record.total_deductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Net Payable Banner */}
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-primary/20 shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Net Payable Salary
              </span>
              <span className="text-xs text-muted-foreground">
                (Gross Earnings minus Total Deductions)
              </span>
            </div>
            <div className="text-right">
              {record.net_salary < 0 ? (
                <div className="text-lg font-mono font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900">
                  -₹{formatMoney(Math.abs(record.net_salary))} (Debt Carryover)
                </div>
              ) : (
                <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{formatMoney(record.net_salary)}
                </div>
              )}
            </div>
          </div>

          {/* Signature Footer Section */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-dashed pt-2">
              <span className="font-semibold text-muted-foreground block">Authorized Manager Signature</span>
            </div>
            <div className="border-t border-dashed pt-2">
              <span className="font-semibold text-muted-foreground block">Employee Signature / Thumb Print</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
