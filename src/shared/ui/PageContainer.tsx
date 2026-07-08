import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "px-[22px]",
        className
      )}
    >
      {children}
    </main>
  );
}
