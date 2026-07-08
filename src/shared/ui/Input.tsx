import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
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
  },
);

Input.displayName = "Input";

export default Input;