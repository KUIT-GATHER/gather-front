import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "box-border h-[200px] w-full resize-none rounded-[12px] border border-stroke bg-white px-[16px] py-[12px]",
        "text-body-14 text-text outline-none",
        "placeholder:text-text-gray-100",
        "focus:border-button",
        className
      )}
      {...props}
    />
  );
}
