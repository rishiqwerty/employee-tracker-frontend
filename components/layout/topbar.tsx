"use client";

import { useEffect } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/useSidebarStore";

import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";
import { useCompanyStore } from "@/store/useCompanyStore";
import { CompanySelector } from "@/components/companies/company-selector";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { activeCompanyId, setActiveCompanyId } = useCompanyStore();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesService.getCompanies(),
  });

  const firstCompanyId = companies.length > 0 ? companies[0].id : null;

  // Set the first company as active by default if none is selected
  useEffect(() => {
    if (firstCompanyId && !activeCompanyId) {
      setActiveCompanyId(firstCompanyId);
    }
  }, [firstCompanyId, activeCompanyId, setActiveCompanyId]);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
        
        {/* Sleek Company Selector Dropdown */}
        <CompanySelector />
        
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 rounded-lg bg-background pl-8 focus-visible:ring-1 md:w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
