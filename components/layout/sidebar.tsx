"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MapPin,
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Wallet, 
  Settings,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useQuery } from "@tanstack/react-query";
import { configService } from "@/services/config.service";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
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
  const { appBrandName, customLogoUrl } = useCompanyStore();

  const { data: branding } = useQuery({
    queryKey: ["app-config-branding"],
    queryFn: () => configService.getAppBranding(),
  });

  const logoSrc = customLogoUrl || branding?.logo_url;
  const brandName = appBrandName || branding?.app_name || "EmployeeTracker";

  return (
    <>
      {/* 1. Desktop Sidebar (md breakpoint and up) */}
      <div
        className={cn(
          "relative hidden h-screen border-r bg-card transition-all duration-300 md:block shrink-0",
          isOpen ? "w-64" : "w-[72px]"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className={cn("flex items-center gap-2.5 font-bold min-w-0", !isOpen && "hidden")}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-8 w-8 rounded-xl object-contain bg-background border p-0.5 shrink-0 shadow-xs"
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono font-bold shrink-0 shadow-xs">
                {brandName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="truncate text-sm font-extrabold tracking-tight">{brandName}</span>
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
                pathname === route.href || (route.href !== "/" && pathname.startsWith(`${route.href}/`))
                  ? "bg-accent text-accent-foreground font-semibold"
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

      {/* 2. Mobile Responsive Slide-Out Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={toggle}
          />

          {/* Slide-out Panel */}
          <div className="relative flex w-4/5 max-w-sm flex-col bg-card border-r shadow-2xl z-50 h-full">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <div className="flex items-center gap-2.5 font-bold">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="h-8 w-8 rounded-xl object-contain bg-background border p-0.5 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono font-bold">
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="truncate text-sm font-bold">{brandName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1 p-3 flex-1 overflow-y-auto">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={toggle} // Close drawer on navigation!
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href || (route.href !== "/" && pathname.startsWith(`${route.href}/`))
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-muted-foreground"
                  )}
                >
                  <route.icon className="h-5 w-5 shrink-0" />
                  <span>{route.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
