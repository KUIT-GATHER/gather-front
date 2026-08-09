import { useEffect, useState } from "react";

import topIcon from "@/assets/icons/Top.svg";
import { cn } from "@/shared/lib/cn";

type ScrollTopButtonProps = {
  className?: string;
};

export function ScrollTopButton({ className }: ScrollTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY >= window.innerHeight);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
      className={cn(
        "fixed right-[max(1.375rem,calc(50%-12.5625rem+1.375rem))] z-20 flex size-14.5 items-center justify-center rounded-[29px] border border-stroke bg-[#F0F6F0] shadow-sm active:bg-[#EEF8F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        className,
      )}
    >
      <img src={topIcon} alt="" className="size-7.25" aria-hidden="true" />
    </button>
  );
}
