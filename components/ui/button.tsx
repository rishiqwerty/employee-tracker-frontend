import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 items-center justify-center rounded-full border text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ease-out outline-none select-none backdrop-blur-2xl active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 " +
  // Top Specular Highlight Glare
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-full before:bg-gradient-to-b before:from-white/40 before:to-transparent hover:before:from-white/70 transition-all " +
  // Hover Light Reflection Sweep Flare
  "after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:hover:translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/45 after:to-transparent after:transition-transform after:duration-700 after:ease-in-out",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-t-white/50 border-b-black/30 border-x-white/20 font-extrabold shadow-[0_4px_20px_rgba(0,0,0,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.6)] hover:bg-primary/90 hover:shadow-[0_6px_28px_rgba(0,0,0,0.25),inset_0_1.5px_3px_rgba(255,255,255,0.8)]",
        outline:
          "bg-background/80 dark:bg-muted/40 border-input text-foreground font-bold shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground font-bold border-t-white/40 border-b-black/10 border-x-white/20 shadow-xs hover:bg-secondary/80",
        ghost:
          "border-transparent text-foreground font-bold hover:bg-accent hover:text-accent-foreground before:hidden hover:before:block",
        destructive:
          "bg-destructive text-white border-t-white/50 border-b-black/30 border-x-white/20 font-bold shadow-[0_4px_20px_rgba(244,63,94,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.6)] hover:bg-destructive/90",
        link: "border-transparent text-primary underline-offset-4 font-bold hover:underline before:hidden after:hidden",
      },
      size: {
        default:
          "h-9 gap-2 px-4 text-xs font-bold",
        xs: "h-6 gap-1 px-2.5 text-[10px] font-bold [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-xs font-bold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-6 text-sm font-extrabold",
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
