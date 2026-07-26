"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Sparkles, 
  Trash2, 
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Palette,
  Check
} from "lucide-react";

import { useCompanyStore } from "@/store/useCompanyStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, ColorTheme } from "@/store/useThemeStore";
import { configService } from "@/services/config.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { userEmail } = useAuthStore();
  const { colorTheme, setColorTheme } = useThemeStore();
  const { setAppBrandName, setCustomLogoUrl } = useCompanyStore();

  const [appName, setAppName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // 1. Fetch system branding config (app_name, logo_url) from backend DB
  const { data: branding, isLoading } = useQuery({
    queryKey: ["app-config-branding"],
    queryFn: () => configService.getAppBranding(),
  });

  // Hydrate system branding state from DB
  useEffect(() => {
    if (branding) {
      if (branding.app_name) {
        setAppName(branding.app_name);
        setAppBrandName(branding.app_name);
      }
      if (branding.logo_url) {
        setLogoUrl(branding.logo_url);
        setCustomLogoUrl(branding.logo_url);
      }
    }
  }, [branding, setAppBrandName, setCustomLogoUrl]);

  // Image Upload Handler (reads file to Base64 Data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setLogoUrl(base64Data);
      toast.success("New logo selected! Click Save Settings to persist.");
    };
    reader.readAsDataURL(file);
  };

  // Handle color accent theme selection with dual persistence (LocalStorage + DB Config)
  const handleSelectColorTheme = (newTheme: ColorTheme) => {
    setColorTheme(newTheme);
    if (userEmail) {
      configService.saveUserTheme(userEmail, newTheme).then(() => {
        queryClient.invalidateQueries({ queryKey: ["user-theme-db", userEmail] });
      }).catch(() => {});
    }
    toast.success(`Accent color changed to ${newTheme}`);
  };

  // Save all settings (Branding + User Theme) to DB config table & LocalStorage
  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<unknown>[] = [
        configService.saveAppBranding(
          appName.trim() || "EmployeeTracker",
          logoUrl.trim() || null
        ),
      ];

      if (userEmail) {
        promises.push(configService.saveUserTheme(userEmail, colorTheme));
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("All branding & theme settings saved to database successfully!");
      setAppBrandName(appName.trim() || "EmployeeTracker");
      setCustomLogoUrl(logoUrl.trim() || null);
      queryClient.invalidateQueries({ queryKey: ["app-config-branding"] });
      queryClient.invalidateQueries({ queryKey: ["user-theme-db", userEmail] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings to database");
    },
  });

  const modeOptions = [
    { key: "light", label: "Light Mode", icon: Sun, description: "Crisp & high contrast" },
    { key: "dark", label: "Dark Mode", icon: Moon, description: "Sleek & easy on eyes" },
    { key: "system", label: "System Sync", icon: Monitor, description: "Matches OS preferences" },
  ];

  const colorAccentOptions: { key: ColorTheme; label: string; bgClass: string }[] = [
    { key: "slate", label: "Obsidian Slate", bgClass: "bg-slate-700 dark:bg-slate-300" },
    { key: "blue", label: "Sapphire Blue", bgClass: "bg-blue-600 dark:bg-blue-400" },
    { key: "emerald", label: "Forest Emerald", bgClass: "bg-emerald-600 dark:bg-emerald-400" },
    { key: "purple", label: "Royal Amethyst", bgClass: "bg-purple-600 dark:bg-purple-400" },
    { key: "amber", label: "Safety Amber", bgClass: "bg-amber-500 dark:bg-amber-400" },
    { key: "rose", label: "Crimson Flare", bgClass: "bg-rose-600 dark:bg-rose-400" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize application brand name, header logo, and user-persisted color accent theme.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Visual Design & Color Accent Themes */}
        <div className="rounded-3xl border bg-card/95 backdrop-blur-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Design Theme & Accent Color Palette</h2>
              <p className="text-xs text-muted-foreground">
                Preferences are saved to LocalStorage and synced to your user profile in the backend database.
              </p>
            </div>
          </div>

          {/* Color Accent Swatches */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Primary Accent Color Palette
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {colorAccentOptions.map((accent) => {
                const isSelected = colorTheme === accent.key;
                return (
                  <button
                    key={accent.key}
                    type="button"
                    onClick={() => handleSelectColorTheme(accent.key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                        : "bg-background/60 hover:bg-muted/50 border-input/80"
                    }`}
                  >
                    <div className={`relative h-7 w-7 rounded-full ${accent.bgClass} flex items-center justify-center shadow-xs mb-1.5`}>
                      {isSelected && <Check className="h-4 w-4 text-white dark:text-black font-extrabold" />}
                    </div>
                    <span className="text-[11px] font-bold text-center truncate w-full">{accent.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light / Dark Mode Toggle Cards */}
          <div className="space-y-3 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Display Mode
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {modeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTheme(opt.key);
                      toast.success(`Display mode set to ${opt.label}`);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/40 shadow-sm"
                        : "bg-background/60 hover:bg-muted/50 border-input/80"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Application Branding Configuration */}
        <div className="rounded-3xl border bg-card/95 backdrop-blur-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Application Branding</h2>
              <p className="text-xs text-muted-foreground">
                Title and logo are stored in the backend <code className="font-mono bg-muted px-1 rounded">configs</code> table as key-value entries.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">Loading current configuration...</div>
          ) : (
            <div className="space-y-5">
              {/* App Title */}
              <div className="space-y-2">
                <Label htmlFor="appName" className="text-xs font-semibold">
                  Application Brand Name *
                </Label>
                <Input
                  id="appName"
                  placeholder="e.g. EmployeeTracker, BuildCorp Operations..."
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  Stored as config key <code className="font-mono bg-muted px-1 rounded text-[10px]">app_name</code> — displayed in header and sidebar navigation.
                </p>
              </div>

              {/* Logo Preview & File Uploader */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Application Header Logo</Label>
                
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
                  {/* Live Logo Preview Box */}
                  <div className="relative h-16 w-16 rounded-2xl border bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {logoUrl ? (
                      <img src={logoUrl} alt="App Logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor="logo-upload-input" className="cursor-pointer">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          Upload Logo File
                        </div>
                        <input
                          id="logo-upload-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>

                      {logoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoUrl("")}
                          className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Upload PNG, JPG, SVG or WEBP (Max 2MB). Stored as config key <code className="font-mono bg-muted px-1 rounded text-[10px]">logo_url</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Image URL input */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="logoUrlDirect" className="text-xs font-semibold">
                  Or Direct Image URL
                </Label>
                <Input
                  id="logoUrlDirect"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-card border p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Persisted to system database config table & LocalStorage.
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLoading}
            className="rounded-full px-8 font-bold shadow-md gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
