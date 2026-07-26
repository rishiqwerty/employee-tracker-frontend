import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely format API / Axios / Validation errors into a user-friendly string.
 * Prevents React crash when FastAPI returns an array of validation error objects.
 */
export function formatErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null) {
    // Axios Error or HTTP Error check
    const errObj = error as Record<string, unknown>;
    if ("isAxiosError" in errObj || "response" in errObj) {
      const axiosErr = error as import("axios").AxiosError;
      const data = axiosErr.response?.data as { detail?: unknown; message?: unknown } | undefined;
      const detail = data?.detail || data?.message;

      if (typeof detail === "string") return detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => {
            if (typeof item === "string") return item;
            if (typeof item === "object" && item !== null) {
              if ("msg" in item) return String((item as { msg: string }).msg);
              if ("message" in item) return String((item as { message: string }).message);
            }
            return String(item);
          })
          .filter(Boolean);
        if (messages.length > 0) return messages.join("; ");
      }
    }

    if ("message" in errObj && typeof errObj.message === "string") {
      return errObj.message;
    }
  }

  return fallback;
}
