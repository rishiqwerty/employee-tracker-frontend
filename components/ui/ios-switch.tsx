"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, Sparkles } from "lucide-react";

interface IosSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export function IosSwitch({
  checked,
  onCheckedChange,
  label,
  id,
  disabled = false,
}: IosSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white/25 dark:bg-black/25 backdrop-blur-2xl border border-t-white/50 border-b-black/10 border-x-white/25 dark:border-t-white/30 dark:border-b-black/40 dark:border-x-white/10 rounded-2xl p-3.5 shadow-xl shadow-black/5 transition-all duration-300 hover:bg-white/35 dark:hover:bg-black/35 hover:border-t-white/70">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-xs font-semibold cursor-pointer select-none flex items-center gap-2.5",
            checked ? "text-foreground font-bold" : "text-muted-foreground"
          )}
        >
          {checked ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-t-emerald-300/60 border-emerald-500/30 backdrop-blur-xl px-2.5 py-1 rounded-full text-[11px] shadow-xs shadow-emerald-500/20">
              <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-500/15 text-muted-foreground font-medium border border-t-white/40 border-slate-500/20 backdrop-blur-xl px-2.5 py-1 rounded-full text-[11px]">
              <X className="h-3 w-3" />
              Inactive
            </span>
          )}
          <span>{label}</span>
        </label>
      )}

      {/* iOS 26 Translucent Glass Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "group/switch relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-all duration-300 ease-out backdrop-blur-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 shadow-inner overflow-hidden",
          checked
            ? "bg-gradient-to-r from-emerald-500/85 to-teal-400/85 border-t-white/70 border-b-black/20 border-x-white/40 shadow-[0_0_20px_rgba(16,185,129,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:from-emerald-500 hover:to-teal-400 hover:border-t-white/90"
            : "bg-white/20 dark:bg-slate-800/40 backdrop-blur-2xl border-t-white/50 border-b-black/20 border-x-white/20 hover:border-t-white/80 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.2)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="sr-only">{label || "Toggle state"}</span>

        {/* Top Specular Light Flare Streak */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent group-hover/switch:from-white/70 transition-all" />

        {/* Hover Light Sweep Reflection Flare */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/switch:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out" />

        {/* Translucent Glass Thumb Knob */}
        <span
          className={cn(
            "pointer-events-none relative z-10 inline-block h-6 w-6 rounded-full transition-transform duration-300 ease-spring transform flex items-center justify-center text-[10px]",
            "bg-gradient-to-b from-white/95 via-white/85 to-white/55 dark:from-white dark:to-slate-200/80 backdrop-blur-md border-t-white border-b-slate-300/60 border-x-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.95)]",
            checked ? "translate-x-6 text-emerald-600 font-bold" : "translate-x-0 text-slate-400"
          )}
        >
          {/* Glass Inner Specular Reflection */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/60 to-transparent pointer-events-none" />
          {checked ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
          ) : (
            <X className="h-3 w-3 text-slate-400 stroke-[2.5]" />
          )}
        </span>
      </button>
    </div>
  );
}
