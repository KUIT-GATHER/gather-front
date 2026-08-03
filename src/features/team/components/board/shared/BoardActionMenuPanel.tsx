import { Fragment } from "react";

import { cn } from "@/shared/lib/cn";

export type BoardActionMenuItem = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

type BoardActionMenuPanelProps = {
  items: BoardActionMenuItem[];
  ariaLabel?: string;
  className?: string;
};

export function BoardActionMenuPanel({
  items,
  ariaLabel = "메뉴",
  className,
}: BoardActionMenuPanelProps) {
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      className={cn(
        "absolute top-7 right-0 z-30 flex w-31 flex-col overflow-hidden rounded-xl border border-[#2B6137] bg-white px-3 py-3",
        className,
      )}
    >
      {items.map((item, index) => {
        const isDisabled = item.disabled ?? !item.onClick;

        return (
          <Fragment key={`${item.label}-${index}`}>
            <button
              type="button"
              role="menuitem"
              aria-disabled={isDisabled}
              disabled={isDisabled}
              className={cn(
                "flex h-11 items-center justify-center text-[15px] leading-7 font-medium text-text transition-colors",
                "focus:outline-none",
                isDisabled
                  ? "cursor-default"
                  : "cursor-pointer hover:text-point-red focus:text-point-red active:text-point-red",
              )}
              onClick={isDisabled ? undefined : item.onClick}
            >
              {item.label}
            </button>
            {index < items.length - 1 ? (
              <div
                className="mx-auto h-px w-[100px] bg-stroke"
                aria-hidden="true"
              />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
