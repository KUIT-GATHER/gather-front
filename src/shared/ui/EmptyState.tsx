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
        "flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-muted text-primary">
          {icon}
        </div>
      ) : null}

      <h3 className="text-title-18 text-foreground">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-[280px] text-body-14 text-muted-foreground">
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