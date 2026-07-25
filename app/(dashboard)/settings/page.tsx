"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Sparkles, 
  Trash2, 
  CheckCircle2
} from "lucide-react";

import { useCompanyStore } from "@/store/useCompanyStore";
import { configService } from "@/services/config.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { setAppBrandName, setCustomLogoUrl } = useCompanyStore();

  const [appName, setAppName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Fetch branding config from backend /configs/key/{key} endpoints
  const { data: branding, isLoading } = useQuery({
    queryKey: ["app-config-branding"],
    queryFn: () => configService.getAppBranding(),
  });

  // Hydrate local state and Zustand store from DB values
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

  // Save branding to backend config table via upsert
  const saveMutation = useMutation({
    mutationFn: async () => {
      await configService.saveAppBranding(
        appName.trim() || "EmployeeTracker",
        logoUrl.trim() || null
      );
    },
    onSuccess: () => {
      toast.success("Branding saved to database successfully!");
      setAppBrandName(appName.trim() || "EmployeeTracker");
      setCustomLogoUrl(logoUrl.trim() || null);
      queryClient.invalidateQueries({ queryKey: ["app-config-branding"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save branding config");
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure application brand name and custom header logo stored in system database.
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Card: Application Branding Configuration */}
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
            Persisted to system database config table.
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
