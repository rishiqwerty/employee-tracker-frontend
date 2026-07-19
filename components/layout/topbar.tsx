"use client";

import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/useSidebarStore";

import { useQuery } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";
import { useCompanyStore } from "@/store/useCompanyStore";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { activeCompanyId, setActiveCompanyId } = useCompanyStore();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesService.getCompanies(),
  });

  // Set the first company as active by default if none is selected
  if (companies.length > 0 && !activeCompanyId) {
    setActiveCompanyId(companies[0].id);
  }

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
        
        <div className="flex items-center gap-4">
          <select 
            value={activeCompanyId || ""}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="h-9 w-[180px] md:w-[220px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>Select Company</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
        </div>
        
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
