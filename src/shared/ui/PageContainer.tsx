import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/cn";

type PageContainerSize = "narrow" | "wide";

type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: PageContainerSize;
};

const sizeClasses: Record<PageContainerSize, string> = {
  narrow: "max-w-app",
  wide: "max-w-6xl",
};

export default function PageContainer({
  size = "narrow",
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-5.5", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
