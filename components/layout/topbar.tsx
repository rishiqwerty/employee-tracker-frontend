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
import { NotificationsPopover } from "./notifications-popover";

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur-xs px-2.5 sm:px-4 md:px-6">
      {/* Left Section: Mobile Menu + Company Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 h-8 w-8 sm:h-9 sm:w-9"
          onClick={toggle}
          title="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
        
        {/* Sleek Mobile-Responsive Company Selector Dropdown */}
        <CompanySelector />
        
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 rounded-lg bg-background pl-8 focus-visible:ring-1 md:w-[260px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Right Section: Notifications + Theme + User Nav */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <NotificationsPopover />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
