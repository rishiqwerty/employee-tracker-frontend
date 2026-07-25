"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, MapPin, Briefcase, Calendar, Phone, CreditCard, Building2, ShieldCheck } from "lucide-react";

import { Employee, EmployeeCreate, EmployeeUpdate, employeesService } from "@/services/employees.service";
import { sitesService } from "@/services/sites.service";
import { jobRolesService } from "@/services/job-roles.service";
import { assignmentsService, EmployeeTransfer } from "@/services/assignments.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IosSwitch } from "@/components/ui/ios-switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/store/useCompanyStore";

const employeeSchema = z.object({
  employee_code: z.string().optional(),
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  site_id: z.string().min(1, "Site assignment is mandatory"),
  job_role_id: z.string().min(1, "Job Role is mandatory"),
  joining_date: z.string().min(1, "Joining date is required"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone format").max(20),
  father_name: z.string().optional(),
  alternate_phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid format").optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal('')),
  aadhaar: z.string().max(20).optional(),
  dob: z.string().optional(),
  address: z.string().max(255).optional(),
  bank_account: z.string().max(50).optional(),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format").optional().or(z.literal('')),
  upi: z.string().max(100).optional(),
  emergency_contact: z.string().max(100).optional(),
  active: z.boolean(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeDialog({ open, onOpenChange, employee }: EmployeeDialogProps) {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyStore();
  const isEditing = !!employee;

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

  // Fetch active assignment for editing employee
  const { data: activeAssignment } = useQuery({
    queryKey: ["assignments", employee?.id, "active"],
    queryFn: () => (employee ? assignmentsService.getActiveAssignment(employee.id) : Promise.resolve(null)),
    enabled: !!employee && open,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_code: "",
      full_name: "",
      site_id: "",
      job_role_id: "",
      phone: "",
      alternate_phone: "",
      father_name: "",
      pan: "",
      aadhaar: "",
      dob: "",
      address: "",
      joining_date: new Date().toISOString().split('T')[0],
      bank_account: "",
      ifsc: "",
      upi: "",
      emergency_contact: "",
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      const defaultSite = activeAssignment?.site_id || (sites.length > 0 ? sites[0].id : "");
      const defaultRole = activeAssignment?.job_role_id || (jobRoles.length > 0 ? jobRoles[0].id : "");
      
      if (employee) {
        reset({
          employee_code: employee.employee_code,
          full_name: employee.full_name,
          site_id: defaultSite,
          job_role_id: defaultRole,
          phone: employee.phone,
          alternate_phone: employee.alternate_phone || "",
          father_name: employee.father_name || "",
          pan: employee.pan || "",
          aadhaar: employee.aadhaar || "",
          dob: employee.dob ? String(employee.dob) : "",
          address: employee.address || "",
          joining_date: String(employee.joining_date),
          bank_account: employee.bank_account || "",
          ifsc: employee.ifsc || "",
          upi: employee.upi || "",
          emergency_contact: employee.emergency_contact || "",
          active: employee.active,
        });
      } else {
        reset({
          employee_code: "",
          full_name: "",
          site_id: defaultSite,
          job_role_id: defaultRole,
          phone: "",
          alternate_phone: "",
          father_name: "",
          pan: "",
          aadhaar: "",
          dob: "",
          address: "",
          joining_date: new Date().toISOString().split('T')[0],
          bank_account: "",
          ifsc: "",
          upi: "",
          emergency_contact: "",
          active: true,
        });
      }
    }
  }, [open, employee?.id]);

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      if (!activeCompanyId) throw new Error("No active company selected");

      const payload = {
        employee_code: isEditing ? data.employee_code : undefined,
        full_name: data.full_name,
        phone: data.phone,
        joining_date: data.joining_date,
        active: data.active,
        father_name: data.father_name || null,
        alternate_phone: data.alternate_phone || null,
        pan: data.pan || null,
        aadhaar: data.aadhaar || null,
        dob: data.dob || null,
        address: data.address || null,
        bank_account: data.bank_account || null,
        ifsc: data.ifsc || null,
        upi: data.upi || null,
        emergency_contact: data.emergency_contact || null,
      } as EmployeeCreate | EmployeeUpdate;

      let savedEmp: Employee;
      if (isEditing) {
        savedEmp = await employeesService.updateEmployee(activeCompanyId, employee.id, payload as EmployeeUpdate);
      } else {
        savedEmp = await employeesService.createEmployee(activeCompanyId, payload as EmployeeCreate);
      }

      // Assign / Transfer site and job role
      if (data.site_id && data.job_role_id) {
        const transferPayload: EmployeeTransfer = {
          site_id: data.site_id,
          job_role_id: data.job_role_id,
          effective_from: data.joining_date,
        };
        await assignmentsService.transferEmployee(savedEmp.id, transferPayload);
      }

      return savedEmp;
    },
    onSuccess: () => {
      toast.success(`Employee ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['employees', activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      onOpenChange(false);
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

  const onSubmit = (data: EmployeeFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{isEditing ? "Edit Employee Profile" : "Register New Employee"}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing ? "Update employee details, deployment site, and job role." : "Fill in worker details and assign them to an active site."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* iOS Inset Group 1: Core Worker Profile */}
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Core Worker Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {isEditing ? (
                <div className="space-y-1.5">
                  <Label htmlFor="employee_code" className="text-xs font-semibold">Employee Code</Label>
                  <Input id="employee_code" {...register("employee_code")} disabled className="bg-muted/70 font-mono font-semibold text-xs" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="employee_code" className="text-xs font-semibold">Employee Code</Label>
                  <Input id="employee_code" value="Auto-generated (e.g. E0001)" disabled className="bg-muted/70 text-muted-foreground font-mono italic text-xs" />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-semibold">Full Name *</Label>
                <Input id="full_name" placeholder="e.g. Ramesh Kumar" {...register("full_name")} />
                {errors.full_name && <p className="text-[11px] text-destructive">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">Phone Number *</Label>
                <Input id="phone" {...register("phone")} placeholder="+919876543210" />
                {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="joining_date" className="text-xs font-semibold">Joining Date *</Label>
                <Input id="joining_date" type="date" {...register("joining_date")} />
                {errors.joining_date && <p className="text-[11px] text-destructive">{errors.joining_date.message}</p>}
              </div>
            </div>
          </div>

          {/* iOS Inset Group 2: Site & Designation Deployment */}
          <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Site Deployment & Role Assignment
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="site_id" className="text-xs font-semibold">Target Site *</Label>
                <select
                  id="site_id"
                  {...register("site_id")}
                  className="w-full h-10 rounded-xl border border-input/80 bg-background px-3 py-2 text-sm shadow-2xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="" disabled>Select Site (Mandatory)</option>
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
                  <option value="" disabled>Select Job Role (Mandatory)</option>
                  {jobRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {errors.job_role_id && <p className="text-[11px] text-destructive">{errors.job_role_id.message}</p>}
              </div>
            </div>
          </div>

          {/* iOS Inset Group 3: Optional Identification & Banking */}
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Identification & Banking (Optional)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="father_name" className="text-xs font-semibold">Father&apos;s Name</Label>
                <Input id="father_name" {...register("father_name")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-semibold">Date of Birth</Label>
                <Input id="dob" type="date" {...register("dob")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pan" className="text-xs font-semibold">PAN Number</Label>
                <Input id="pan" {...register("pan")} placeholder="ABCDE1234F" />
                {errors.pan && <p className="text-[11px] text-destructive">{errors.pan.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aadhaar" className="text-xs font-semibold">Aadhaar Number</Label>
                <Input id="aadhaar" {...register("aadhaar")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank_account" className="text-xs font-semibold">Bank Account No.</Label>
                <Input id="bank_account" {...register("bank_account")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ifsc" className="text-xs font-semibold">IFSC Code</Label>
                <Input id="ifsc" {...register("ifsc")} placeholder="SBIN0123456" />
                {errors.ifsc && <p className="text-[11px] text-destructive">{errors.ifsc.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold">Residential Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
          </div>

          <IosSwitch
            id="active"
            checked={watch("active")}
            onCheckedChange={(val) => setValue("active", val)}
            label="Worker Account Status"
          />

          {/* Footer Pill Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              {mutation.isPending ? "Saving Profile..." : "Save Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
