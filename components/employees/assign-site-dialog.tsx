"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    queryFn: () => activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId && open,
  });

  // Fetch available job roles for the active company
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([]),
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
  }, [open, currentSiteId, currentJobRoleId, sites, jobRoles, reset]);

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
        const errorData = error.response?.data as { detail?: string | Record<string, unknown>[] };
        if (typeof errorData?.detail === "string") {
          msg = errorData.detail;
        }
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign to Site & Job Role</DialogTitle>
          <DialogDescription>
            {employee ? `Assign or transfer ${employee.full_name} to a site and select their job role.` : "Assign employee to a site."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="site_id">Target Site *</Label>
            <select
              id="site_id"
              {...register("site_id")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>Select a site (Mandatory)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
            {errors.site_id && <p className="text-xs text-destructive">{errors.site_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_role_id">Job Role / Position *</Label>
            <select
              id="job_role_id"
              {...register("job_role_id")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>Select a job role (Mandatory)</option>
              {jobRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.job_role_id && <p className="text-xs text-destructive">{errors.job_role_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_from">Effective From *</Label>
            <Input id="effective_from" type="date" {...register("effective_from")} />
            {errors.effective_from && <p className="text-xs text-destructive">{errors.effective_from.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Assigning..." : "Save Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
