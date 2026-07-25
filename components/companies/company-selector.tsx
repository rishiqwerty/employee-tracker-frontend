"use client";

import { useState } from "react";
import { Building2, ChevronDown, Plus, Settings2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { companiesService, Company } from "@/services/companies.service";
import { useCompanyStore } from "@/store/useCompanyStore";
import { Button } from "@/components/ui/button";
import { CompanyDialog } from "./company-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CompanySelector() {
  const { activeCompanyId, setActiveCompanyId } = useCompanyStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCompany, setDialogCompany] = useState<Company | null>(null);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesService.getCompanies(),
  });

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const handleOpenAddCompany = () => {
    setDialogCompany(null);
    setDialogOpen(true);
  };

  const handleOpenEditCompany = () => {
    if (activeCompany) {
      setDialogCompany(activeCompany);
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-1 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 w-[130px] sm:w-[190px] md:w-[230px] flex items-center justify-between px-2 sm:px-3 font-semibold shadow-xs rounded-md border border-input bg-background text-xs sm:text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none cursor-pointer shrink">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate min-w-0">
            <div className="bg-primary/10 text-primary p-1 rounded-md shrink-0">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="truncate text-xs sm:text-sm">
              {activeCompany ? activeCompany.company_name : "Select Company"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 opacity-70 ml-1" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[220px] sm:w-[240px] p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Active Company
            </DropdownMenuLabel>
            {companies.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => setActiveCompanyId(c.id)}
                className="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md text-sm font-medium"
              >
                <span className="truncate">{c.company_name}</span>
                {c.id === activeCompanyId && (
                  <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={handleOpenAddCompany}
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs font-semibold text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Direct Manage Company Icon Button next to dropdown */}
      {activeCompany && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenEditCompany}
          className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground shrink-0"
          title="Manage Company Details"
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Manage Company Details</span>
        </Button>
      )}

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={dialogCompany}
      />
    </div>
  );
}
