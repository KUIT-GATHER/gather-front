import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className,
  type = "text",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "box-border h-[48px] rounded-[12px] border border-stroke bg-white px-[16px] py-[12px]",
        "text-[15px] font-normal leading-normal text-text outline-none",
        "placeholder:text-text-gray-100",
        "focus:border-button",
        className
      )}
      {...props}
    />
  );
}
