import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type IconButtonSize = "small" | "medium";
type IconButtonVariant = "ghost" | "surface" | "plain";

export type IconButtonProps = ComponentPropsWithRef<"button"> & {
  label: string;
  icon: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
};

const sizeClasses: Record<IconButtonSize, string> = {
  small: "size-11",
  medium: "size-12",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  small: "[&>svg]:size-5 [&>img]:size-5",
  medium: "[&>svg]:size-6 [&>img]:size-6",
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent text-text hover:bg-text/5 active:bg-text/10",
  plain: "bg-transparent text-text hover:bg-transparent active:bg-transparent",
  surface:
    "border border-stroke bg-white text-text shadow-sm hover:bg-bg active:bg-stroke/50",
};

export default function IconButton({
  ref,
  label,
  icon,
  size = "small",
  variant = "ghost",
  type = "button",
  disabled = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        "disabled:cursor-not-allowed disabled:text-text-gray-100 disabled:opacity-60",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center",
          iconSizeClasses[size],
        )}
      >
        {icon}
      </span>
    </button>
  );
}
