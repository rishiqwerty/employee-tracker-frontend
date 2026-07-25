"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { advancesService } from "@/services/advances.service";
import { deductionsService } from "@/services/deductions.service";
import { PayrollRecord } from "@/services/payroll.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const expenseSchema = z.object({
  category: z.enum(["ADVANCE", "UNIFORM"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  date: z.string().min(1, "Transaction date is required"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PayrollRecord | null;
  defaultDate?: string;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  record,
  defaultDate,
}: AddExpenseDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "ADVANCE",
      amount: 0,
      date: defaultDate || new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        category: "ADVANCE",
        amount: 0,
        date: defaultDate || new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open, record?.employee_id, defaultDate, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      if (!record) throw new Error("No worker selected");

      if (data.category === "ADVANCE") {
        return advancesService.createAdvance({
          employee_id: record.employee_id,
          amount: data.amount,
          advance_date: data.date,
          notes: data.notes || `Advance issued on ${data.date}`,
        });
      } else {
        return deductionsService.createDeduction({
          employee_id: record.employee_id,
          deduction_type: "UNIFORM",
          amount: data.amount,
          deduction_date: data.date,
          notes: data.notes || `Uniform deduction on ${data.date}`,
        });
      }
    },
    onSuccess: (_, variables) => {
      const typeLabel = variables.category === "ADVANCE" ? "Advance payment" : "Uniform deduction";
      toast.success(`${typeLabel} recorded for ${record?.full_name}`);
      queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
      queryClient.invalidateQueries({ queryKey: ["backend-advances"] });
      queryClient.invalidateQueries({ queryKey: ["backend-deductions"] });
      onOpenChange(false);
    },
    onError: (error: Error | import("axios").AxiosError) => {
      let msg = "Failed to record entry";
      if ("isAxiosError" in error && error.isAxiosError) {
        const errorData = error.response?.data as { detail?: string };
        if (typeof errorData?.detail === "string") {
          msg = errorData.detail;
        }
      } else {
        msg = error.message;
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Record Advance / Uniform Expense</DialogTitle>
          <DialogDescription>
            {record
              ? `Record an advance payment or uniform deduction entry for ${record.full_name} (${record.employee_code}).`
              : "Record worker expense entry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Entry Category *</Label>
            <select
              id="category"
              {...register("category")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ADVANCE">Financial Advance Payment (Issue Cash)</option>
              <option value="UNIFORM">Uniform / Safety Kit Deduction</option>
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 1000"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Transaction Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date *</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Reason (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g. Safety boots and jacket issued"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Recording..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
