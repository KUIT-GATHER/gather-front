import type { ReactNode } from "react";
import ArrowIcon from "@/assets/icons/Arrow.svg";

import { cn } from "@/shared/lib/cn";
import IconButton from "@/shared/ui/IconButton";

type PageHeaderTitleAlign = "center" | "left";

type PageHeaderProps = {
  title?: string;
  titleAlign?: PageHeaderTitleAlign;
  onBack?: () => void;
  backLabel?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  sticky?: boolean;
  className?: string;
};

export default function PageHeader({
  title,
  titleAlign = "left",
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
        icon={<img src={ArrowIcon} alt="" className="rotate-180" />}
        className="size-9 [&>span>img]:size-9"
        onClick={onBack}
      />
    ) : null);

  return (
    <header
      className={cn(
        "relative w-full bg-bg pt-[env(safe-area-inset-top)]",
        sticky && "sticky top-0 z-40",
        className,
      )}
    >
      <div className="relative flex h-[70px] items-center justify-between">
        <div
          className={cn(
            "z-10 -ml-3 flex items-center justify-start",
            titleAlign === "left" ? "min-w-0 flex-1" : "min-w-11",
          )}
        >
          {resolvedLeftAction}

          {title && titleAlign === "left" ? (
            <h1 className="min-w-0 truncate text-[20px] font-semibold text-text">
              {title}
            </h1>
          ) : null}
        </div>

        {title && titleAlign === "center" ? (
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
