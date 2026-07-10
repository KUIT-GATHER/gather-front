import type { ComponentPropsWithRef } from "react";

import { cn } from "@/shared/lib/cn";

type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  invalid?: boolean;
};

export default function Textarea({
  ref,
  className,
  invalid = false,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? invalid}
      className={cn(
        "box-border h-50 w-full resize-none rounded-xl border border-stroke bg-white px-4 py-3",
        "text-body-14 text-text outline-none",
        "placeholder:text-text-gray-100",
        "focus:border-button",
        "disabled:bg-stroke/30 disabled:text-text-gray-100",
        invalid && "border-point-red focus:border-point-red",
        className,
      )}
      {...props}
    />
  );
}
