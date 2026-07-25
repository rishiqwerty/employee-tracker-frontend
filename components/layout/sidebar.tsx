"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  MapPin,
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Wallet,
  Settings,
  ChevronLeft,
  Menu
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Companies",
    icon: Building2,
    href: "/companies",
  },
  {
    label: "Sites",
    icon: MapPin,
    href: "/sites",
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
  },
  {
    label: "Attendance",
    icon: CalendarClock,
    href: "/attendance",
  },
  {
    label: "Payroll",
    icon: Wallet,
    href: "/payroll",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div
      className={cn(
        "relative hidden h-screen border-r bg-card transition-all duration-300 md:block",
        isOpen ? "w-64" : "w-[72px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className={cn("flex items-center gap-2 font-bold", !isOpen && "hidden")}>
          <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
            WT
          </div>
          <span className="truncate">WorkTracker</span>
        </div>
        {isOpen && (
          <Button variant="ghost" size="icon" onClick={toggle} className="ml-auto h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {!isOpen && (
          <Button variant="ghost" size="icon" onClick={toggle} className="mx-auto h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-1 p-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === route.href || pathname.startsWith(`${route.href}/`)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
              !isOpen && "justify-center px-0"
            )}
            title={!isOpen ? route.label : undefined}
          >
            <route.icon className={cn("h-5 w-5 shrink-0", !isOpen && "mx-auto")} />
            {isOpen && <span>{route.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
