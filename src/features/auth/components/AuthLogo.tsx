import { cn } from "@/shared/lib/cn";

import SplashLeftIcon from "@/assets/icons/SplashLeftIcon.svg";
import SplashRightIcon from "@/assets/icons/SplashRightIcon.svg";

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
          "relative",
          isLarge ? "h-32 w-57.5" : "h-28 w-50",
        )}
      >
        <img
          src={SplashLeftIcon}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute z-20 h-auto",
            isLarge
              ? "top-0 left-5.5 w-32.5"
              : "top-0 left-4.5 w-29",
          )}
        />
        <img
          src={SplashRightIcon}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute z-10 h-auto",
            isLarge
              ? "top-5.5 right-4.5 w-26.75"
              : "top-5 right-3.5 w-24",
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