import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "dark" | "danger" | "dangerOutline";
type ButtonSize = "large" | "medium" | "pill" | "next";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-button text-text2 hover:brightness-95",

  dark: "bg-icon text-text2 hover:brightness-95",

  danger:
    "border border-point-red bg-point-red text-text2 hover:brightness-95",

  dangerOutline:
    "border border-point-red bg-point-red/8 text-point-red hover:bg-point-red/12",
};

const sizeClasses: Record<ButtonSize, string> = {
  large: cn(
    "h-[52px] rounded-[40px] px-[30px] py-[12px]",
    "text-[18px] font-semibold leading-[140%]",
  ),

  medium: cn(
    "h-[44px] rounded-[12px] px-[20px] py-[8px]",
    "text-[18px] font-medium leading-normal",
  ),

  pill: cn(
    "h-[48px] rounded-[40px] px-[20px] py-[12px]",
    "text-[18px] font-semibold leading-[140%]",
    "w-fit whitespace-nowrap",
  ),

  next: cn(
    "rounded-[40px] px-[32px] py-[12px]",
    "text-[18px] font-semibold leading-[140%]",
    "w-fit whitespace-nowrap",
  ),
};

const defaultWidthClasses: Record<ButtonSize, string> = {
  large: "w-[356px]",
  medium: "w-[358px]",
  pill: "",
  next: "",
};

export default function Button({
  ref,
  variant = "primary",
  size,
  fullWidth = false,
  disabled = false,
  type = "button",
  className,
  children,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const resolvedSize =
    size ??
    (variant === "danger" || variant === "dangerOutline"
      ? "medium"
      : "large");

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "box-border inline-flex items-center justify-center gap-[8px]",
        "text-center transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-stroke disabled:text-text2",
        variantClasses[variant],
        sizeClasses[resolvedSize],
        fullWidth ? "w-full" : defaultWidthClasses[resolvedSize],
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
          {leftIcon}
        </span>
      ) : null}

      {children}

      {rightIcon ? (
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}