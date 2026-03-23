import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black px-2.5 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-comic-skyblue text-comic-black shadow-sm",
        secondary: "bg-comic-cream text-comic-black",
        destructive: "bg-comic-red text-comic-white shadow-sm",
        outline: "bg-transparent text-comic-black",
        green: "border-comic-green/30 bg-comic-green/15 text-comic-green",
        yellow: "border-comic-yellow/30 bg-comic-yellow/15 text-comic-yellow",
        red: "border-comic-red/30 bg-comic-red/15 text-comic-red",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
