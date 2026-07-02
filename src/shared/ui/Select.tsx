import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import CheckIcon from "@/assets/icons/Check.svg";
import SortIcon from "@/assets/icons/Sort.svg";

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
  const selectedOption = options.find((option) => option.value === value);
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-[44px] items-center justify-center gap-[8px]",
          "px-[2px] py-[1px]",
          "text-[14px] font-normal leading-[28px] text-text",
          "whitespace-nowrap"
        )}
      >
        <img
          src={SortIcon}
          alt=""
          className="h-[15px] w-[15px] shrink-0"
        />

        <span>
            {selectedOption ? selectedOption.label : "전체"}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-23px top-[44px] z-50",
            "inline-flex h-[328px] w-[174px] flex-col items-start gap-[4px]",
            "rounded-[12px] border border-icon bg-bg p-[12px]"
          )}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const isLast = index === options.length - 1;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex h-[43px] w-full items-center justify-between",
                  "text-left text-[15px] font-normal leading-[28px]",
                  !isLast && "border-b border-stroke",
                  selected ? "text-point-red" : "text-text"
                )}
              >
                <span>{option.label}</span>

                {selected && (
                  <img
                    src={CheckIcon}
                    alt="선택됨"
                    className="h-[13.758px] w-[14px] shrink-0"
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
