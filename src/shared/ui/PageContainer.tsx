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
        "mx-auto min-h-screen w-full max-w-[402px] bg-bg px-[22px]",
        className
      )}
    >
      {children}
    </main>
  );
}