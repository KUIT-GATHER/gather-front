import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";

type ErrorStateAction = {
  label: string;
  onClick: () => void;
};

type ErrorStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  primaryAction?: ErrorStateAction;
  secondaryAction?: ErrorStateAction;
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
};

export function ErrorState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  headingLevel: Heading = "h2",
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center px-2 text-center",
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-full bg-point-red/8 text-point-red"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}

      <Heading className="max-w-80 text-title-24 text-text">{title}</Heading>

      {description ? (
        <p className="mt-2 max-w-80 text-body-14 text-text-gray-300">
          {description}
        </p>
      ) : null}

      {primaryAction || secondaryAction ? (
        <div className="mt-7 flex w-full max-w-70 flex-col gap-2.5">
          {primaryAction ? (
            <Button fullWidth onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}

          {secondaryAction ? (
            <Button fullWidth variant="dark" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
