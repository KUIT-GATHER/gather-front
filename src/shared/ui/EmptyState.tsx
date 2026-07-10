import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-55 flex-col items-center justify-center rounded-2xl border border-dashed border-stroke bg-white px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-text/8 text-text">
          {icon}
        </div>
      ) : null}

      <h3 className="text-title-18 text-text">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-70 text-body-14 text-text-gray-100">
          {description}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <Button className="mt-5" size="medium" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
