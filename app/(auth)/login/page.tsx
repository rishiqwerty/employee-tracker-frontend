"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock, Mail, Eye, EyeOff, Sparkles, KeyRound } from "lucide-react";
import { AxiosError } from "axios";

import { authService } from "@/services/auth.service";
import { configService } from "@/services/config.service";
import { formatErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useThemeStore, ColorTheme } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const { setColorTheme } = useThemeStore();
  const { appBrandName, customLogoUrl } = useCompanyStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch dynamic application branding from backend config
  const { data: branding } = useQuery({
    queryKey: ["app-config-branding"],
    queryFn: () => configService.getAppBranding(),
  });

  const logoSrc = customLogoUrl || branding?.logo_url;
  const brandName = appBrandName || branding?.app_name || "EmployeeTracker";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values.email, values.password),
    onSuccess: async (data, variables) => {
      setToken(data.access_token, variables.email);
      // Fetch logged-in user's custom theme from DB before navigating
      try {
        const userTheme = await configService.getUserTheme(variables.email);
        if (userTheme) {
          setColorTheme(userTheme as ColorTheme);
        }
      } catch {
        // Fallback silently if theme fetch fails
      }
      toast.success(`Welcome back to ${brandName}!`);
      router.push("/");
    },
    onError: (error: unknown) => {
      console.error(error);
      const msg = formatErrorMessage(error, "Login failed. Please check your credentials.");
      setServerError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError("");
    mutation.mutate(data);
  };

  // Quick Helper: Fill Demo Credentials
  const fillDemoAccount = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    toast.info("Demo credentials pre-filled");
  };

  return (
    <Card className="w-full rounded-3xl border border-white/20 bg-card/85 backdrop-blur-2xl shadow-2xl transition-all duration-300">
      <CardHeader className="space-y-3 text-center pb-4 pt-8">
        {/* Dynamic Logo / Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-background/80 shadow-md backdrop-blur-md">
          {logoSrc ? (
            <img src={logoSrc} alt={brandName} className="h-12 w-12 object-contain p-1" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-xl font-black">
              {brandName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <CardTitle className="text-2xl font-black tracking-tight">{brandName}</CardTitle>
          <CardDescription className="text-xs mt-1">
            Sign in to access your workforce & payroll portal
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...register("email")}
              className="h-11 rounded-xl text-sm"
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="h-11 rounded-xl text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive text-center">
              {serverError}
            </div>
          )}

          {/* Liquid Glass Submit Button */}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-11 rounded-full font-bold text-sm shadow-md mt-2"
          >
            {mutation.isPending ? "Authenticating..." : "Sign in to Dashboard"}
          </Button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="rounded-2xl border bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-semibold text-[11px] flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-primary" /> Quick Demo Accounts
            </span>
            <Sparkles className="h-3 w-3 text-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fillDemoAccount("admin@example.com", "admin123")}
              className="text-[11px] font-semibold h-7 truncate"
            >
              Supervisor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fillDemoAccount("admin@acme.inc", "admin123")}
              className="text-[11px] font-semibold h-7 truncate"
            >
              Admin User
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
