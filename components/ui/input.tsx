import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      value={value ?? ""}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-input/80 bg-background/60 dark:bg-muted/30 px-3.5 py-2 text-sm shadow-2xs transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-muted/80",
        className
      )}
      {...props}
    />
  );
}

export { Input };
