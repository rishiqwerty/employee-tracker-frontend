"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { sitesService } from "@/services/sites.service";
import { Button } from "@/components/ui/button";
import { SitesTable } from "@/components/sites/sites-table";
import { SiteDialog } from "@/components/sites/site-dialog";
import { useCompanyStore } from "@/store/useCompanyStore";

export default function SitesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { activeCompanyId } = useCompanyStore();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["sites", activeCompanyId],
    queryFn: () => activeCompanyId ? sitesService.getSites(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId,
  });

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Selected</h2>
          <p className="text-muted-foreground">
            Please select a company from the top navigation bar to view and manage its sites.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your company&apos;s locations and active payscales.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      <SitesTable data={sites} isLoading={isLoading} />

      <SiteDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
