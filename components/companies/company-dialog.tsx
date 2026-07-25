"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Company, CompanyCreate, CompanyUpdate, companiesService } from "@/services/companies.service";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update company details here." : "Enter details for the new company here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" {...register("company_name")} />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input id="registration_number" {...register("registration_number")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input id="gst_number" {...register("gst_number")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_active" 
              {...register("is_active")}
              className="h-4 w-4 rounded border-gray-300" 
            />
            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
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
