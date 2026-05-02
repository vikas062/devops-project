import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/10 text-slate-100",
        success: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
        warning: "border-amber-400/40 bg-amber-400/15 text-amber-200",
        info: "border-sky-400/40 bg-sky-400/15 text-sky-200",
        outline: "text-slate-800 dark:text-slate-200 border-black/20 dark:border-white/20 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
));

Badge.displayName = "Badge";

export { Badge, badgeVariants };
