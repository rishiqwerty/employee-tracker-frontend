"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we are not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router, pathname]);

  // Optionally return null or a loader while checking auth state to prevent flash
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
