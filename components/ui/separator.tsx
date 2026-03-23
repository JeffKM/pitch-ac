"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 border-comic-black/20 data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-b-[var(--comic-border-thin)] data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-r-[var(--comic-border-thin)]",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
