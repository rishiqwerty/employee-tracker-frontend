"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";

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
      <DialogContent className="sm:max-w-[460px] p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Record Worker Entry</DialogTitle>
              <DialogDescription className="text-xs">
                {record
                  ? `Record an advance or uniform deduction entry for ${record.full_name} (${record.employee_code}).`
                  : "Record worker expense entry."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            {/* Category Select */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold">Entry Category *</Label>
              <select
                id="category"
                {...register("category")}
                className="w-full h-10 rounded-xl border border-input/80 bg-background px-3 py-2 text-sm shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="ADVANCE">Financial Advance Payment (Issue Cash)</option>
                <option value="UNIFORM">Uniform / Safety Kit Deduction</option>
              </select>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1000"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Transaction Date Input */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold">Transaction Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-[11px] text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">Notes / Reason (Optional)</Label>
              <Input
                id="notes"
                placeholder="e.g. Safety boots and jacket issued"
                {...register("notes")}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-full px-6 text-xs font-bold shadow-md"
            >
              {mutation.isPending ? "Recording..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
