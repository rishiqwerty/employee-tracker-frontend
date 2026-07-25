"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Site, SiteCreate, SiteUpdate, sitesService } from "@/services/sites.service";
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

const siteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  address: z.string().min(5, "Address must be at least 5 characters").max(255),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  contact_person: z.string().max(100).optional().or(z.literal('')),
  contact_number: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone format").optional().or(z.literal('')),
  active: z.boolean(),
});

type SiteFormValues = z.infer<typeof siteSchema>;

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
}

export function SiteDialog({ open, onOpenChange, site }: SiteDialogProps) {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompanyStore();
  const isEditing = !!site;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      contact_person: "",
      contact_number: "",
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (site) {
        reset({
          name: site.name,
          address: site.address,
          city: site.city,
          state: site.state,
          contact_person: site.contact_person || "",
          contact_number: site.contact_number || "",
          active: site.active,
        });
      } else {
        reset({
          name: "",
          address: "",
          city: "",
          state: "",
          contact_person: "",
          contact_number: "",
          active: true,
        });
      }
    }
  }, [open, site, reset]);

  const mutation = useMutation({
    mutationFn: (data: SiteFormValues) => {
      if (!activeCompanyId) throw new Error("No active company selected");
      
      const payload: SiteCreate = {
        ...data,
        contact_person: data.contact_person || null,
        contact_number: data.contact_number || null,
      };

      if (isEditing) {
        return sitesService.updateSite(activeCompanyId, site.id, payload as SiteUpdate);
      } else {
        return sitesService.createSite(activeCompanyId, payload);
      }
    },
    onSuccess: () => {
      toast.success(`Site ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['sites', activeCompanyId] });
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

  const onSubmit = (data: SiteFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Site" : "Add Site"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update site details here." : "Enter details for the new site."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input id="name" {...register("name")} placeholder="Main Factory" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" {...register("state")} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" {...register("contact_person")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input id="contact_number" {...register("contact_number")} placeholder="+91..." />
              {errors.contact_number && <p className="text-xs text-destructive">{errors.contact_number.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <input 
              type="checkbox" 
              id="active" 
              {...register("active")}
              className="h-4 w-4 rounded border-gray-300" 
            />
            <Label htmlFor="active" className="cursor-pointer">Active Site</Label>
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
