import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black bg-transparent px-3 py-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] shadow-sm transition-colors file:border-0 file:bg-transparent file:font-[family-name:var(--font-permanent-marker)] file:text-[length:var(--comic-body-base)] file:text-comic-black placeholder:text-comic-black/50 focus-visible:ring-1 focus-visible:ring-comic-skyblue focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
