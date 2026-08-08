import { useEffect, useState, type RefObject } from "react";

import topIcon from "@/assets/icons/Top.svg";
import { cn } from "@/shared/lib/cn";

type ScrollTopButtonProps<T extends HTMLElement> = {
  itemCount: number;
  thresholdRef: RefObject<T | null>;
  minItemCount?: number;
  className?: string;
};

export const SCROLL_TOP_BUTTON_THRESHOLD_INDEX = 29;

export function ScrollTopButton<T extends HTMLElement>({
  itemCount,
  thresholdRef,
  minItemCount = 30,
  className,
}: ScrollTopButtonProps<T>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const target = thresholdRef.current;

      setVisible(
        itemCount >= minItemCount
          ? target !== null &&
              target.getBoundingClientRect().top <= window.innerHeight
          : false,
      );
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, [itemCount, minItemCount, thresholdRef]);

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
