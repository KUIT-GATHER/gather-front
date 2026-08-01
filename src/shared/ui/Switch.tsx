import type { ComponentPropsWithoutRef } from "react";
import { Switch as RadixSwitch } from "radix-ui";

import { cn } from "@/shared/lib/cn";

export type SwitchProps = ComponentPropsWithoutRef<typeof RadixSwitch.Root>;

export default function Switch({ className, ...props }: SwitchProps) {
  return (
    <RadixSwitch.Root
      className={cn(
        "inline-flex h-6 w-12 shrink-0 items-center rounded-full bg-text-gray-100 p-0.5 transition-colors",
        "data-[state=checked]:bg-icon",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block size-5 rounded-full bg-white shadow-sm transition-transform",
          "data-[state=checked]:translate-x-6",
        )}
      />
    </RadixSwitch.Root>
  );
}
