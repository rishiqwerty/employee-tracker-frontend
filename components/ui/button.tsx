import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 items-center justify-center rounded-full border text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-out outline-none select-none backdrop-blur-2xl active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 " +
  // Top Specular Highlight Glare
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-full before:bg-gradient-to-b before:from-white/50 before:to-transparent hover:before:from-white/80 transition-all " +
  // Hover Light Reflection Sweep Flare
  "after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:hover:translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/45 after:to-transparent after:transition-transform after:duration-700 after:ease-in-out",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary/70 via-primary/75 to-primary/60 border-t-white/70 border-b-black/30 border-x-white/30 text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:from-primary/85 hover:to-primary/75 hover:border-t-white/90 hover:shadow-[0_6px_28px_rgba(0,0,0,0.25),inset_0_1.5px_3px_rgba(255,255,255,0.9)]",
        outline:
          "bg-white/20 dark:bg-white/5 border-t-white/70 border-b-black/10 border-x-white/30 dark:border-t-white/30 dark:border-b-black/30 dark:border-x-white/10 text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.8)] hover:bg-white/40 dark:hover:bg-white/15 hover:border-t-white/100 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),inset_0_1.5px_3px_rgba(255,255,255,0.95)]",
        secondary:
          "bg-secondary/35 dark:bg-secondary/25 border-t-white/50 border-b-black/10 border-x-white/20 text-secondary-foreground shadow-xs hover:bg-secondary/60 hover:border-t-white/80",
        ghost:
          "border-transparent text-foreground hover:bg-white/25 dark:hover:bg-white/10 hover:border-t-white/40 before:hidden hover:before:block",
        destructive:
          "bg-gradient-to-b from-rose-500/65 via-rose-600/70 to-rose-700/55 border-t-white/70 border-b-black/30 border-x-white/30 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.7)] hover:from-rose-500/85 hover:to-rose-600/80 hover:border-t-white/90 hover:shadow-[0_6px_28px_rgba(244,63,94,0.5),inset_0_1.5px_3px_rgba(255,255,255,0.9)]",
        link: "border-transparent text-primary underline-offset-4 hover:underline before:hidden after:hidden",
      },
      size: {
        default:
          "h-9 gap-2 px-4 text-xs font-semibold",
        xs: "h-6 gap-1 px-2.5 text-[10px] font-semibold [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-6 text-sm font-bold",
        icon: "size-9 rounded-full",
        "icon-xs":
          "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
