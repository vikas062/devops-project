import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-navy-900 hover:bg-accent2",
        outline: "border border-glass-border text-slate-900 dark:text-slate-100 hover:border-accent/60",
        ghost: "text-slate-900 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10",
        subtle: "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-slate-100 hover:bg-black/10 dark:hover:bg-white/20"
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-12 px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
