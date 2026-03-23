import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comic-skyblue disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-comic-skyblue text-comic-black shadow-sm hover:bg-comic-skyblue/80",
        destructive:
          "bg-comic-red text-comic-white shadow-sm hover:bg-comic-red/80",
        outline:
          "bg-comic-white text-comic-black shadow-sm hover:bg-comic-cream",
        secondary:
          "bg-comic-cream text-comic-black shadow-sm hover:bg-comic-cream/80",
        ghost: "border-transparent hover:bg-comic-cream hover:text-comic-black",
        link: "border-transparent text-comic-skyblue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[var(--comic-panel-radius)] px-3 text-[length:var(--comic-body-xs)]",
        lg: "h-10 rounded-[var(--comic-panel-radius)] px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
