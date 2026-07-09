import type { ComponentPropsWithRef } from "react";

import { cn } from "@/shared/lib/cn";

type InputProps = ComponentPropsWithRef<"input"> & {
  invalid?: boolean;
};

export default function Input({
  ref,
  className,
  type = "text",
  invalid = false,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={ariaInvalid ?? invalid}
      className={cn(
        "box-border h-[48px] w-full rounded-[12px] border border-stroke bg-white px-[16px] py-[12px]",
        "text-[15px] font-normal leading-normal text-text outline-none",
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