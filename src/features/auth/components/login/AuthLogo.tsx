import { cn } from "@/shared/lib/cn";

import gatherLogo from "@/assets/images/Gather-logo.png";

type AuthLogoProps = {
  size?: "large" | "medium";
  className?: string;
};

export function AuthLogo({ size = "large", className }: AuthLogoProps) {
  const isLarge = size === "large";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "flex items-center justify-center",
          isLarge ? "h-32 w-57.5" : "h-28 w-50",
        )}
      >
        <img
          src={gatherLogo}
          alt="Gather 로고"
          className={cn(
            "h-auto",
            isLarge ? "w-57.5 max-w-full" : "w-50 max-w-full",
          )}
        />
      </div>

      <h1
        className={cn(
          "font-mimi font-normal leading-none tracking-[-1.2px] text-text",
          isLarge ? "mt-4 text-[40px]" : "mt-3 text-[36px]",
        )}
      >
        Gather
      </h1>
    </div>
  );
}
