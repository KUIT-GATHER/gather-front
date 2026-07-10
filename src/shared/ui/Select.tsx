import { useEffect, useId, useRef, useState } from "react";

import CheckIcon from "@/assets/icons/Check.svg";
import SortIcon from "@/assets/icons/Sort.svg";
import { cn } from "@/shared/lib/cn";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function Select({
  options,
  value,
  onChange,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2",
          "px-0.5 py-px",
          "text-sm font-normal leading-7 text-text",
          "whitespace-nowrap",
        )}
      >
        <img
          src={SortIcon}
          alt=""
          className="h-3.75 w-3.75 shrink-0"
        />

        <span>{selectedOption ? selectedOption.label : "전체"}</span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute top-11 right-5.75 z-50",
            "inline-flex h-82 w-43.5 flex-col items-start gap-1",
            "rounded-xl border border-icon bg-bg p-3",
          )}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const isLast = index === options.length - 1;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex h-10.75 w-full items-center justify-between",
                  "text-left text-[15px] font-normal leading-7",
                  !isLast && "border-b border-stroke",
                  selected ? "text-point-red" : "text-text",
                )}
              >
                <span>{option.label}</span>

                {selected && (
                  <img
                    src={CheckIcon}
                    alt="선택됨"
                    className="h-[13.758px] w-3.5 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
