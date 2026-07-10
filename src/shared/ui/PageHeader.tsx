import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import IconButton from "@/shared/ui/IconButton";

type PageHeaderProps = {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  sticky?: boolean;
  className?: string;
};

export default function PageHeader({
  title,
  onBack,
  backLabel = "뒤로가기",
  leftAction,
  rightAction,
  sticky = false,
  className,
}: PageHeaderProps) {
  const resolvedLeftAction =
    leftAction ??
    (onBack ? (
      <IconButton
        label={backLabel}
        icon={<ChevronLeft />}
        onClick={onBack}
      />
    ) : null);

  return (
    <header
      className={cn(
        "relative w-full bg-white pt-[env(safe-area-inset-top)]",
        sticky && "sticky top-0 z-40",
        className,
      )}
    >
      <div className="relative flex h-14 items-center justify-between">
        <div className="z-10 flex min-w-11 items-center justify-start">
          {resolvedLeftAction}
        </div>

        {title ? (
          <h1 className="pointer-events-none absolute left-1/2 max-w-[calc(100%-7rem)] -translate-x-1/2 truncate text-title-18 text-text">
            {title}
          </h1>
        ) : null}

        <div className="z-10 flex min-w-11 items-center justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
