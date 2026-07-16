import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import Spinner from "@/shared/ui/Spinner";

type LoadingStateProps = {
  label?: string;
  className?: string;
  children?: ReactNode;
};

export default function LoadingState({
  label = "불러오는 중",
  className,
  children,
}: LoadingStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 text-center",
        className,
      )}
    >
      {children ?? <Spinner ariaHidden />}
      <p className="text-body-14 text-text-gray-100">{label}</p>
    </section>
  );
}
