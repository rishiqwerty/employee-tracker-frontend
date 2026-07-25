import { api } from './api';

/**
 * Backend Config API uses a key-value store model:
 *   Config { id, key, value, env, active, description, created_at, updated_at }
 *
 * Routes:
 *   GET    /configs/                 → list all configs
 *   GET    /configs/key/{key}        → get single config by key (env=production)
 *   POST   /configs/                 → create { key, value, env, description }
 *   PATCH  /configs/{config_id}      → update { value }
 */

export interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  env: string;
  active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfigCreate {
  key: string;
  value: string;
  env?: string;
  description?: string;
}

export const configService = {
  /**
   * Get a single config entry by key. Returns null if not found (404).
   */
  getByKey: async (key: string, env = "production"): Promise<ConfigEntry | null> => {
    try {
      const response = await api.get<ConfigEntry>(`/configs/key/${key}`, {
        params: { env },
      });
      return response.data;
    } catch {
      return null; // 404 or any error → treat as not found
    }
  },

  /**
   * Create or update a config key-value pair.
   * Tries to fetch existing entry first; if found, patches it; otherwise creates it.
   */
  upsert: async (key: string, value: string, description?: string): Promise<ConfigEntry> => {
    const existing = await configService.getByKey(key);
    if (existing) {
      const response = await api.patch<ConfigEntry>(`/configs/${existing.id}`, { value });
      return response.data;
    } else {
      const response = await api.post<ConfigEntry>('/configs/', {
        key,
        value,
        env: "production",
        description: description || `App setting: ${key}`,
      });
      return response.data;
    }
  },

  /**
   * Helper: Get app_name config value.
   */
  getAppName: async (): Promise<string | null> => {
    const entry = await configService.getByKey("app_name");
    return entry?.value ?? null;
  },

  /**
   * Helper: Get logo_url config value.
   */
  getLogoUrl: async (): Promise<string | null> => {
    const entry = await configService.getByKey("logo_url");
    return entry?.value ?? null;
  },

  /**
   * Helper: Get all app branding config (app_name + logo_url) in parallel.
   */
  getAppBranding: async (): Promise<{ app_name: string | null; logo_url: string | null }> => {
    const [appName, logoUrl] = await Promise.all([
      configService.getAppName(),
      configService.getLogoUrl(),
    ]);
    return { app_name: appName, logo_url: logoUrl };
  },

  /**
   * Helper: Save app_name and logo_url to backend config table.
   */
  saveAppBranding: async (appName: string, logoUrl: string | null): Promise<void> => {
    await Promise.all([
      configService.upsert("app_name", appName, "Application brand name displayed in header and sidebar"),
      configService.upsert("logo_url", logoUrl || "", "Application header logo URL or Base64 data URI"),
    ]);
  },
};
