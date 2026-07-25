"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

import { Company, CompanyCreate, CompanyUpdate, companiesService } from "@/services/companies.service";
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

const companySchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  registration_number: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}

export function CompanyDialog({ open, onOpenChange, company }: CompanyDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!company;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: "",
      registration_number: "",
      gst_number: "",
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          company_name: company.company_name,
          registration_number: company.registration_number || "",
          gst_number: company.gst_number || "",
          address: company.address || "",
          is_active: company.is_active,
        });
      } else {
        reset({
          company_name: "",
          registration_number: "",
          gst_number: "",
          address: "",
          is_active: true,
        });
      }
    }
  }, [open, company, reset]);

  const mutation = useMutation({
    mutationFn: (data: CompanyFormValues) => {
      const payload = {
        ...data,
        registration_number: data.registration_number || null,
        gst_number: data.gst_number || null,
        address: data.address || null,
      } as CompanyCreate | CompanyUpdate;

      if (isEditing) {
        return companiesService.updateCompany(company.id, payload as CompanyUpdate);
      } else {
        return companiesService.createCompany(payload as CompanyCreate);
      }
    },
    onSuccess: () => {
      toast.success(`Company ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onOpenChange(false);
    },
    onError: (error: Error | import("axios").AxiosError) => {
      let msg = "An error occurred";
      if ("isAxiosError" in error && error.isAxiosError) {
        const errorData = error.response?.data as { detail?: string };
        msg = errorData?.detail || msg;
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data: CompanyFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{isEditing ? "Manage Company Details" : "Add New Company"}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing ? "Update company registration, tax numbers, and address." : "Register a new company entity in the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="company_name" className="text-xs font-semibold">Company Name *</Label>
              <Input id="company_name" placeholder="e.g. Acme Constructions Pvt Ltd" {...register("company_name")} />
              {errors.company_name && (
                <p className="text-[11px] text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="registration_number" className="text-xs font-semibold">Registration No.</Label>
                <Input id="registration_number" placeholder="CIN / Reg No." {...register("registration_number")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gst_number" className="text-xs font-semibold">GST Number</Label>
                <Input id="gst_number" placeholder="22AAAAA0000A1Z5" {...register("gst_number")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">Registered Address</Label>
              <Input id="address" placeholder="City, State, Zip" {...register("address")} />
            </div>
          </div>

          <IosSwitch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(val) => setValue("is_active", val)}
            label="Active Entity Status"
          />

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
              {mutation.isPending ? "Saving..." : "Save Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
