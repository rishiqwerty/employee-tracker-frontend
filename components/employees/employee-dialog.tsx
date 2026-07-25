"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Employee, EmployeeCreate, EmployeeUpdate, employeesService } from "@/services/employees.service";
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

const employeeSchema = z.object({
  employee_code: z.string().min(1, "Employee code is required").max(50),
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
    queryFn: () => activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId && open,
  });

  // Fetch available job roles for the active company
  const { data: jobRoles = [] } = useQuery({
    queryKey: ["job-roles", activeCompanyId],
    queryFn: () => activeCompanyId ? jobRolesService.getJobRoles(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId && open,
  });

  // Fetch active assignment for editing employee
  const { data: activeAssignment } = useQuery({
    queryKey: ["assignments", employee?.id, "active"],
    queryFn: () => employee ? assignmentsService.getActiveAssignment(employee.id) : Promise.resolve(null),
    enabled: !!employee && open,
  });

  const {
    register,
    handleSubmit,
    reset,
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
      if (employee) {
        reset({
          employee_code: employee.employee_code,
          full_name: employee.full_name,
          site_id: activeAssignment?.site_id || (sites.length > 0 ? sites[0].id : ""),
          job_role_id: activeAssignment?.job_role_id || (jobRoles.length > 0 ? jobRoles[0].id : ""),
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
          site_id: sites.length > 0 ? sites[0].id : "",
          job_role_id: jobRoles.length > 0 ? jobRoles[0].id : "",
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
  }, [open, employee, activeAssignment, sites, jobRoles, reset]);

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      if (!activeCompanyId) throw new Error("No active company selected");

      const payload = {
        employee_code: data.employee_code,
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update employee details, site assignment, and job role." : "Enter details for the new employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Core Details */}
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input id="employee_code" {...register("employee_code")} />
              {errors.employee_code && <p className="text-xs text-destructive">{errors.employee_code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            {/* Mandatory Deployment Fields */}
            <div className="space-y-2">
              <Label htmlFor="site_id">Site Assignment *</Label>
              <select
                id="site_id"
                {...register("site_id")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>Select Site (Mandatory)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
              {errors.site_id && <p className="text-xs text-destructive">{errors.site_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_role_id">Job Role / Designation *</Label>
              <select
                id="job_role_id"
                {...register("job_role_id")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>Select Job Role (Mandatory)</option>
                {jobRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.job_role_id && <p className="text-xs text-destructive">{errors.job_role_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining_date">Joining Date *</Label>
              <Input id="joining_date" type="date" {...register("joining_date")} />
              {errors.joining_date && <p className="text-xs text-destructive">{errors.joining_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" {...register("phone")} placeholder="+919876543210" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            {/* Optional Details */}
            <div className="space-y-2">
              <Label htmlFor="father_name">Father&apos;s Name</Label>
              <Input id="father_name" {...register("father_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" {...register("pan")} placeholder="ABCDE1234F" />
              {errors.pan && <p className="text-xs text-destructive">{errors.pan.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input id="aadhaar" {...register("aadhaar")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account">Bank Account No.</Label>
              <Input id="bank_account" {...register("bank_account")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input id="ifsc" {...register("ifsc")} placeholder="SBIN0123456" />
              {errors.ifsc && <p className="text-xs text-destructive">{errors.ifsc.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <input 
              type="checkbox" 
              id="active" 
              {...register("active")}
              className="h-4 w-4 rounded border-gray-300" 
            />
            <Label htmlFor="active" className="cursor-pointer">Active Employee</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
