"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export function UserNav() {
  const router = useRouter();
  const { userEmail, userRole, setUser, logout, isAuthenticated } = useAuthStore();

  // Fetch logged in user profile from GET /users/me
  const { data: userProfile } = useQuery({
    queryKey: ["user-me"],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (userProfile?.email) {
      setUser(userProfile.email, userProfile.role);
    }
  }, [userProfile, setUser]);

  const email = userProfile?.email || userEmail || "admin@example.com";
  const role = userProfile?.role || userRole || "ADMIN";
  const name = email.split("@")[0].replace(".", " ");
  
  // Format Initials (e.g. "admin" -> "AD", "rishav" -> "RI")
  const initials = name.length >= 2 ? name.substring(0, 2).toUpperCase() : "US";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "relative h-8 w-8 rounded-full" })}>
        <Avatar className="h-8 w-8 cursor-pointer border shadow-xs">
          <AvatarImage src="" alt={email} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-2" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold capitalize leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground font-mono truncate">
                {email}
              </p>
              <span className="inline-block pt-1 text-[10px] font-bold text-primary tracking-wider uppercase">
                {role}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" className="cursor-pointer" />}>
            Settings & Branding
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer font-medium">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
