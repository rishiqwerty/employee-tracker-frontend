"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, IndianRupee } from "lucide-react";

import { payscalesService, Payscale, PayscaleCreate } from "@/services/payscales.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const payscaleSchema = z.object({
  role: z.string().min(1, "Role/Position is required").max(100),
  daily_wage: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(v => v > 0, "Daily wage must be strictly greater than 0"),
  overtime_rate: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(v => v >= 0, "Overtime rate cannot be negative"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type PayscaleFormInput = z.input<typeof payscaleSchema>;
type PayscaleFormOutput = z.output<typeof payscaleSchema>;

interface PayscaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  siteName?: string;
}

export function PayscaleDialog({ open, onOpenChange, siteId, siteName }: PayscaleDialogProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch active payscales for this site across all roles
  const { data: activePayscales = [], isLoading: isFetching } = useQuery({
    queryKey: ['payscales', siteId, 'active'],
    queryFn: () => siteId ? payscalesService.getActivePayscales(siteId) : Promise.resolve([]),
    enabled: !!siteId && open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PayscaleFormInput, any, PayscaleFormOutput>({
    resolver: zodResolver(payscaleSchema),
    defaultValues: {
      role: "General",
      daily_wage: "0",
      overtime_rate: "0",
      effective_from: new Date().toISOString().split('T')[0],
    },
  });

  const handleEditRole = (payscale: Payscale) => {
    setValue("role", payscale.role);
    setValue("daily_wage", payscale.daily_wage.toString());
    setValue("overtime_rate", payscale.overtime_rate.toString());
    setValue("effective_from", new Date().toISOString().split('T')[0]);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    reset({
      role: "",
      daily_wage: "0",
      overtime_rate: "0",
      effective_from: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(true);
  };

  const mutation = useMutation({
    mutationFn: (data: PayscaleFormOutput) => {
      if (!siteId) throw new Error("No site selected");
      const payload: PayscaleCreate = {
        site_id: siteId,
        role: data.role,
        daily_wage: data.daily_wage,
        overtime_rate: data.overtime_rate,
        effective_from: data.effective_from,
      };
      return payscalesService.createPayscale(payload);
    },
    onSuccess: () => {
      toast.success("Payscale saved successfully");
      queryClient.invalidateQueries({ queryKey: ['payscales', siteId, 'active'] });
      setShowAddForm(false);
      reset();
    },
    onError: (error: Error | import("axios").AxiosError) => {
      let msg = "An error occurred";
      if ("isAxiosError" in error && error.isAxiosError) {
        const errorData = error.response?.data as { detail?: string | Record<string, unknown>[] };
        if (typeof errorData?.detail === 'string') {
          msg = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          const firstError = errorData.detail[0] as Record<string, unknown>;
          msg = (firstError?.msg as string) || msg;
        }
      } else {
        msg = error.message;
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data: PayscaleFormOutput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setShowAddForm(false);
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Payscales</DialogTitle>
          <DialogDescription>
            {siteName ? `Set role-based payscales for ${siteName}.` : "Set role-based payscales for this site."}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading active payscales...</div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* List of active payscales */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Active Payscales by Role</h4>
                {!showAddForm && (
                  <Button size="sm" variant="outline" onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1" /> Add Role Payscale
                  </Button>
                )}
              </div>

              {activePayscales.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-muted/40 text-sm text-muted-foreground">
                  No active payscales defined for this site yet.
                </div>
              ) : (
                <div className="border rounded-lg divide-y bg-card">
                  {activePayscales.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-semibold">
                          {p.role}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            ₹{p.daily_wage} / day
                          </span>
                          <span className="text-xs text-muted-foreground">
                            OT: ₹{p.overtime_rate}/hr • Effective: {p.effective_from}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleEditRole(p)}>
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form for adding / updating a role's payscale */}
            {showAddForm && (
              <div className="border rounded-lg p-4 bg-accent/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-primary" /> Set Role Payscale
                  </h4>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Position *</Label>
                    <Input 
                      id="role" 
                      placeholder="e.g. Worker, Supervisor, Mason, Driver"
                      {...register("role")} 
                    />
                    {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="daily_wage">Daily Wage (₹) *</Label>
                      <Input 
                        id="daily_wage" 
                        type="number" 
                        step="0.01" 
                        {...register("daily_wage")} 
                      />
                      {errors.daily_wage && <p className="text-xs text-destructive">{errors.daily_wage.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overtime_rate">Overtime Rate / Hr (₹) *</Label>
                      <Input 
                        id="overtime_rate" 
                        type="number" 
                        step="0.01" 
                        {...register("overtime_rate")} 
                      />
                      {errors.overtime_rate && <p className="text-xs text-destructive">{errors.overtime_rate.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effective_from">Effective From *</Label>
                    <Input 
                      id="effective_from" 
                      type="date" 
                      {...register("effective_from")} 
                    />
                    {errors.effective_from && <p className="text-xs text-destructive">{errors.effective_from.message}</p>}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Save Role Payscale"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
