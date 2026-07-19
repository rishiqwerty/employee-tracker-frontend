"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { companiesService } from "@/services/companies.service";
import { Button } from "@/components/ui/button";
import { CompaniesTable } from "@/components/companies/companies-table";
import { CompanyDialog } from "@/components/companies/company-dialog";

export default function CompaniesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesService.getCompanies(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your registered companies and legal entities.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <CompaniesTable data={companies} isLoading={isLoading} />

      <CompanyDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
