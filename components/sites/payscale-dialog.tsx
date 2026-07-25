"use client";

import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IndianRupee, Plus, Briefcase } from "lucide-react";

import { payscalesService, PayscaleCreate } from "@/services/payscales.service";
import { jobRolesService, JobRole } from "@/services/job-roles.service";
import { useCompanyStore } from "@/store/useCompanyStore";
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

interface PayscaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  siteName?: string;
}

export function PayscaleDialog({
  open,
  onOpenChange,
  siteId,
  siteName,
}: PayscaleDialogProps) {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyStore();

  const [rates, setRates] = useState<Record<string, string>>({});
  const [newRoleName, setNewRoleName] = useState("");
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);

  // Fetch available job roles for active company
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => (activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  // Fetch active payscales for this site
  const { data: existingPayscales = [] } = useQuery({
    queryKey: ["payscales", siteId],
    queryFn: () => (siteId ? payscalesService.getActivePayscales(siteId) : Promise.resolve([])),
    enabled: !!siteId && open,
  });

  const payscalesKey = useMemo(
    () => existingPayscales.map((p) => `${p.job_role_id}:${p.daily_wage}`).join("|"),
    [existingPayscales]
  );

  useEffect(() => {
    if (open) {
      const initialRates: Record<string, string> = {};
      existingPayscales.forEach((p) => {
        initialRates[p.job_role_id] = String(p.daily_wage);
      });
      setRates(initialRates);
    }
  }, [open, payscalesKey]);

  const handleRateChange = (jobRoleId: string, value: string) => {
    setRates((prev) => ({
      ...prev,
      [jobRoleId]: value,
    }));
  };

  // Mutation to create a new job role / designation for company & site
  const addRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      if (!activeCompanyId) throw new Error("No active company selected");
      return jobRolesService.createJobRole(activeCompanyId, {
        name: roleName.trim(),
        description: `Created for ${siteName || "company sites"}`,
        active: true,
      });
    },
    onSuccess: (newRole: JobRole) => {
      toast.success(`Designation '${newRole.name}' created successfully`);
      queryClient.invalidateQueries({ queryKey: ["job-roles", activeCompanyId] });
      setNewRoleName("");
      setShowAddRoleInput(false);
      // Pre-fill default rate placeholder
      setRates((prev) => ({ ...prev, [newRole.id]: "500" }));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create designation");
    },
  });

  const handleAddRoleSubmit = () => {
    if (!newRoleName.trim()) {
      toast.warning("Please enter a designation name");
      return;
    }
    addRoleMutation.mutate(newRoleName);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error("No site selected");

      const promises = Object.entries(rates).map(([job_role_id, wageStr]) => {
        const daily_wage = parseFloat(wageStr);
        if (isNaN(daily_wage) || daily_wage < 0) return Promise.resolve();

        const payload: PayscaleCreate = {
          site_id: siteId,
          job_role_id,
          daily_wage,
          overtime_rate: 0,
          effective_from: new Date().toISOString().split("T")[0],
        };
        return payscalesService.createPayscale(payload);
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Site daily wage payscales updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payscales", siteId] });
      queryClient.invalidateQueries({ queryKey: ["all-payscales"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save payscales");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Configure Site Payscales</DialogTitle>
                <DialogDescription className="text-xs">
                  Set daily wage rates (₹) per designation for <span className="font-semibold text-foreground">{siteName}</span>.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Header Action: Add New Designation Button */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Designation Wage Rates
            </h4>

            {!showAddRoleInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddRoleInput(true)}
                className="h-7 text-xs gap-1 text-primary border-primary/30"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Role
              </Button>
            )}
          </div>

          {/* Inline New Role Creator Form */}
          {showAddRoleInput && (
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 rounded-2xl space-y-2.5">
              <Label className="text-xs font-semibold text-primary">New Designation / Role Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. Crane Operator, Mason, Welder..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddRoleSubmit}
                  disabled={addRoleMutation.isPending}
                  className="h-9 text-xs shrink-0"
                >
                  {addRoleMutation.isPending ? "Adding..." : "Add Role"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddRoleInput(false)}
                  className="h-9 text-xs shrink-0 text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* List of Job Roles & Daily Wage Inputs */}
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3">
            {jobRoles.length === 0 ? (
              <div className="text-xs text-center text-muted-foreground py-4">
                No job roles defined yet. Click &quot;Add New Role&quot; above to create one.
              </div>
            ) : (
              jobRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between gap-4 bg-background p-2.5 rounded-xl border">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">{role.name}</Label>
                    <p className="text-[10px] text-muted-foreground">Base daily rate for {role.name}</p>
                  </div>

                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="500"
                      value={rates[role.id] || ""}
                      onChange={(e) => handleRateChange(role.id, e.target.value)}
                      className="pl-6 h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              ))
            )}
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
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || jobRoles.length === 0}
              className="rounded-full px-6 text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {mutation.isPending ? "Saving..." : "Save Payscales"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
