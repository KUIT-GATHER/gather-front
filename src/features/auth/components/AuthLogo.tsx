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
          isLarge ? "h-[128px] w-[230px]" : "h-[112px] w-[200px]",
        )}
      >
        <img
          src={SplashLeftIcon}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute z-20 h-auto",
            isLarge
              ? "top-0 left-[22px] w-[130px]"
              : "top-0 left-[18px] w-[116px]",
          )}
        />
        <img
          src={SplashRightIcon}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute z-10 h-auto",
            isLarge
              ? "top-[22px] right-[18px] w-[107px]"
              : "top-[20px] right-[14px] w-[96px]",
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