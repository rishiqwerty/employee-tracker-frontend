"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, ColorTheme } from "@/store/useThemeStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { configService } from "@/services/config.service";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { userEmail } = useAuthStore();
  const { colorTheme, setColorTheme } = useThemeStore();
  const { setAppBrandName, setCustomLogoUrl } = useCompanyStore();

  // 1. Ensure current color theme is applied to DOM on mount and whenever colorTheme changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (colorTheme === "slate") {
        document.documentElement.removeAttribute("data-color-theme");
      } else {
        document.documentElement.setAttribute("data-color-theme", colorTheme);
      }
    }
  }, [colorTheme]);

  // 2. Fetch system branding config (app_name, logo_url) from backend DB on layout mount
  const { data: branding } = useQuery({
    queryKey: ["app-config-branding"],
    queryFn: () => configService.getAppBranding(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // 3. Hydrate system branding to Zustand store
  useEffect(() => {
    if (branding) {
      if (branding.app_name) {
        setAppBrandName(branding.app_name);
      }
      if (branding.logo_url) {
        setCustomLogoUrl(branding.logo_url);
      }
    }
  }, [branding, setAppBrandName, setCustomLogoUrl]);

  // 4. Fetch logged-in user's saved color theme from backend DB on login / layout mount
  const { data: dbUserTheme } = useQuery({
    queryKey: ["user-theme-db", userEmail],
    queryFn: () => (userEmail ? configService.getUserTheme(userEmail) : Promise.resolve(null)),
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // 5. Hydrate DB user theme on initial load (only when dbUserTheme value resolves)
  useEffect(() => {
    if (dbUserTheme) {
      setColorTheme(dbUserTheme as ColorTheme);
    }
  }, [dbUserTheme, setColorTheme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
