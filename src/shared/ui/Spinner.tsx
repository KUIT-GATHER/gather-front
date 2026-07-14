import { cn } from "@/shared/lib/cn";

type SpinnerSize = "small" | "medium";

type SpinnerProps = {
  className?: string;
  size?: SpinnerSize;
  label?: string;
  ariaHidden?: boolean;
};

const dotSizeClasses: Record<SpinnerSize, string> = {
  small: "size-1.5",
  medium: "size-2",
};

export default function Spinner({
  className,
  size = "medium",
  label = "로딩 중",
  ariaHidden = false,
}: SpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role={ariaHidden ? undefined : "status"}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden || undefined}
    >
      <span
        className={cn(
          "animate-bounce rounded-full bg-text-gray-100 motion-reduce:animate-none",
          "[animation-delay:-0.3s]",
          dotSizeClasses[size],
        )}
      />
      <span
        className={cn(
          "animate-bounce rounded-full bg-text-gray-100 motion-reduce:animate-none",
          "[animation-delay:-0.15s]",
          dotSizeClasses[size],
        )}
      />
      <span
        className={cn(
          "animate-bounce rounded-full bg-text-gray-100 motion-reduce:animate-none",
          dotSizeClasses[size],
        )}
      />
    </div>
  );
}
