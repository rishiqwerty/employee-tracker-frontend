"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { Site, SiteCreate, SiteUpdate, sitesService } from "@/services/sites.service";
import { formatErrorMessage } from "@/lib/utils";
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

const siteSchema = z.object({
  name: z.string().min(2, "Site name must be at least 2 characters").max(100),
  address: z.string().min(1, "Address is required").max(255),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  contact_person: z.string().optional(),
  is_active: z.boolean(),
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      contact_person: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (site) {
        reset({
          name: site.name,
          address: site.address || "",
          city: site.city,
          state: site.state,
          contact_person: site.contact_person || "",
          is_active: site.active,
        });
      } else {
        reset({
          name: "",
          address: "",
          city: "",
          state: "",
          contact_person: "",
          is_active: true,
        });
      }
    }
  }, [open, site, reset]);

  const mutation = useMutation({
    mutationFn: (data: SiteFormValues) => {
      if (!activeCompanyId) throw new Error("No active company selected");

      const payload = {
        ...data,
        address: data.address,
        contact_person: data.contact_person || null,
      } as SiteCreate | SiteUpdate;

      if (isEditing) {
        return sitesService.updateSite(activeCompanyId, site.id, payload as SiteUpdate);
      } else {
        return sitesService.createSite(activeCompanyId, payload as SiteCreate);
      }
    },
    onSuccess: () => {
      toast.success(`Site ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["sites", activeCompanyId] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(formatErrorMessage(error, "Failed to save site details"));
    },
  });

  const onSubmit = (data: SiteFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{isEditing ? "Edit Construction Site" : "Add New Site"}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing ? "Update site location and contact supervisor." : "Register a new project site for workforce deployment."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="bg-muted/40 dark:bg-muted/20 p-4 rounded-2xl border space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Site Name *</Label>
              <Input id="name" placeholder="e.g. Metro Line Phase 2" {...register("name")} />
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold">City *</Label>
                <Input id="city" placeholder="e.g. Mumbai" {...register("city")} />
                {errors.city && <p className="text-[11px] text-destructive">{errors.city.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold">State *</Label>
                <Input id="state" placeholder="e.g. Maharashtra" {...register("state")} />
                {errors.state && <p className="text-[11px] text-destructive">{errors.state.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">Full Address *</Label>
              <Input id="address" placeholder="Sector / Street Address" {...register("address")} />
              {errors.address && <p className="text-[11px] text-destructive">{errors.address.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_person" className="text-xs font-semibold">Site Supervisor / Contact</Label>
              <Input id="contact_person" placeholder="Manager Name / Phone" {...register("contact_person")} />
            </div>
          </div>

          <IosSwitch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(val) => setValue("is_active", val)}
            label="Active Site Operational Status"
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
              {mutation.isPending ? "Saving..." : "Save Site"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
