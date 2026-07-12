import type { ComponentPropsWithRef } from "react";

import { cn } from "@/shared/lib/cn";

type SkeletonProps = ComponentPropsWithRef<"div">;

export default function Skeleton({ ref, className, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-stroke/70 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
