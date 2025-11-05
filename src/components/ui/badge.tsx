import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-250",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        
        // Status variants usando cores de feedback do design system
        active: "border-transparent bg-success text-success-foreground shadow-sm",
        pending: "border-transparent bg-warning text-warning-foreground shadow-sm",
        error: "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        info: "border-transparent bg-info text-info-foreground shadow-sm",
        
        // Variantes adicionais com bordas
        "active-outline": "border-success bg-success/10 text-success-foreground",
        "pending-outline": "border-warning bg-warning/10 text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
