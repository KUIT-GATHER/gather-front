import { cn } from "@/shared/lib/cn";

type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5",
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-gray-100 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-gray-100 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-gray-100" />
    </div>
  );
}