import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type FormFieldProps = {
  label: string;
  required?: boolean;
  count?: number;
  maxLength?: number;
  htmlFor?: string;
  children: ReactNode;
  error?: string;
  className?: string;
  labelClassName?: string;
};

export default function FormField({
  label,
  required = false,
  count,
  maxLength,
  htmlFor,
  children,
  error,
  className,
  labelClassName,
}: FormFieldProps) {
  const showCounter =
    typeof count === "number" && typeof maxLength === "number";

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "mb-[12px] block text-[18px] font-normal leading-[28px] text-text",
          labelClassName,
        )}
      >
        {label}
        {required && <span className="text-point-red">*</span>}
      </label>

      {children}

      {error ? (
        <p className="mt-[6px] text-[12px] font-normal leading-[18px] text-point-red">
          {error}
        </p>
      ) : null}

      {showCounter && !error ? (
        <p className="mt-[8px] text-right text-[12px] font-normal leading-[18px] text-text-gray-100">
          {count}/{maxLength}
        </p>
      ) : null}
    </div>
  );
}