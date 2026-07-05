import { cn } from "@/shared/lib/cn";

type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[6px]",
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="h-[8px] w-[8px] animate-bounce rounded-full bg-text-gray-100 [animation-delay:-0.3s]" />
      <span className="h-[8px] w-[8px] animate-bounce rounded-full bg-text-gray-100 [animation-delay:-0.15s]" />
      <span className="h-[8px] w-[8px] animate-bounce rounded-full bg-text-gray-100" />
    </div>
  );
}