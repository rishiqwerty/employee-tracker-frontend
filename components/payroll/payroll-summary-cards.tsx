"use client";

import { DollarSign, CreditCard, ShieldAlert, Wallet } from "lucide-react";

interface PayrollSummaryCardsProps {
  totalGross: number;
  totalAdvances: number;
  totalUniforms: number;
  totalNet: number;
}

export function PayrollSummaryCards({
  totalGross,
  totalAdvances,
  totalUniforms,
  totalNet,
}: PayrollSummaryCardsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const stats = [
    {
      label: "Gross Salary",
      value: formatCurrency(totalGross),
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Advances Given",
      value: formatCurrency(totalAdvances),
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      label: "Uniform Deductions",
      value: formatCurrency(totalUniforms),
      icon: ShieldAlert,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      label: "Net Total Payable",
      value: formatCurrency(totalNet),
      icon: Wallet,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm"
          >
            <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
