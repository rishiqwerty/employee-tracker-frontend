"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Briefcase, Calendar } from "lucide-react";

import { Employee } from "@/services/employees.service";
import { sitesService } from "@/services/sites.service";
import { jobRolesService } from "@/services/job-roles.service";
import { assignmentsService, EmployeeTransfer } from "@/services/assignments.service";
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
import { useCompanyStore } from "@/store/useCompanyStore";

const transferSchema = z.object({
  site_id: z.string().min(1, "Site is mandatory"),
  job_role_id: z.string().min(1, "Job Role is mandatory"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface AssignSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  currentSiteId?: string;
  currentJobRoleId?: string;
}

export function AssignSiteDialog({
  open,
  onOpenChange,
  employee,
  currentSiteId,
  currentJobRoleId,
}: AssignSiteDialogProps) {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyStore();

  // Fetch available sites for the active company
  const { data: sites = [] } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => (activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  // Fetch available job roles for the active company
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => (activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([])),
    enabled: !!activeCompanyId && open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      site_id: "",
      job_role_id: "",
      effective_from: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        site_id: currentSiteId || (sites.length > 0 ? sites[0].id : ""),
        job_role_id: currentJobRoleId || (jobRoles.length > 0 ? jobRoles[0].id : ""),
        effective_from: new Date().toISOString().split("T")[0],
      });
    }
  }, [open, employee?.id]);

  const mutation = useMutation({
    mutationFn: (data: TransferFormValues) => {
      if (!employee) throw new Error("No employee selected");
      const payload: EmployeeTransfer = {
        site_id: data.site_id,
        job_role_id: data.job_role_id,
        effective_from: data.effective_from,
      };
      return assignmentsService.transferEmployee(employee.id, payload);
    },
    onSuccess: () => {
      toast.success("Employee deployment & job role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
    },
    onError: (error: Error | import("axios").AxiosError) => {
      let msg = "An error occurred";
      if ("isAxiosError" in error && error.isAxiosError) {
        const errorData = error.response?.data as { detail?: string };
        msg = errorData?.detail || msg;
      } else {
        msg = error.message;
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data: TransferFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Assign or Transfer Site</DialogTitle>
              <DialogDescription className="text-xs">
                {employee ? `Update site location & designation for ${employee.full_name}.` : "Assign worker to a site."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="site_id" className="text-xs font-semibold">Target Construction Site *</Label>
              <select
                id="site_id"
                {...register("site_id")}
                className="w-full h-10 rounded-xl border border-input/80 bg-background px-3 py-2 text-sm shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="" disabled>Select site (Mandatory)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
              {errors.site_id && <p className="text-[11px] text-destructive">{errors.site_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job_role_id" className="text-xs font-semibold">Job Role / Designation *</Label>
              <select
                id="job_role_id"
                {...register("job_role_id")}
                className="w-full h-10 rounded-xl border border-input/80 bg-background px-3 py-2 text-sm shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="" disabled>Select job role (Mandatory)</option>
                {jobRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.job_role_id && <p className="text-[11px] text-destructive">{errors.job_role_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="effective_from" className="text-xs font-semibold">Effective From Date *</Label>
              <Input id="effective_from" type="date" {...register("effective_from")} />
              {errors.effective_from && <p className="text-[11px] text-destructive">{errors.effective_from.message}</p>}
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
              {mutation.isPending ? "Assigning..." : "Save Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
