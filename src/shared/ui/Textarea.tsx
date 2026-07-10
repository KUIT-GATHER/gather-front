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
        "box-border h-50 w-full resize-none rounded-xl border border-stroke bg-white px-4 py-3",
        "text-body-14 text-text outline-none",
        "placeholder:text-text-gray-100",
        "focus:border-button",
        className
      )}
      {...props}
    />
  );
}
