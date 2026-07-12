import { Select as RadixSelect } from "radix-ui";

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
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
};

export default function Select({
  options,
  value,
  onChange,
  className,
  placeholder = "전체",
  disabled = false,
  name,
  required,
  invalid = false,
  ariaLabel,
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg",
          "px-0.5 py-px",
          "text-sm font-normal leading-7 text-text",
          "whitespace-nowrap transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          "disabled:cursor-not-allowed disabled:text-text-gray-100",
          invalid && "text-point-red ring-1 ring-point-red/70",
          className,
        )}
      >
        <RadixSelect.Icon asChild>
          <img src={SortIcon} alt="" className="h-3.75 w-3.75 shrink-0" />
        </RadixSelect.Icon>

        <RadixSelect.Value placeholder={placeholder} />
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 w-43.5 overflow-hidden rounded-xl border border-icon bg-bg p-3",
            "max-h-[min(20.5rem,var(--radix-select-content-available-height))]",
          )}
        >
          <RadixSelect.Viewport className="max-h-[inherit] overflow-y-auto">
            {options.map((option, index) => {
              const isLast = index === options.length - 1;

              return (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "flex min-h-10.75 w-full cursor-pointer items-center justify-between gap-3",
                    "text-left text-[15px] font-normal leading-7 text-text outline-none",
                    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                    "data-[highlighted]:text-point-red",
                    "data-[state=checked]:text-point-red",
                    !isLast && "border-b border-stroke",
                  )}
                >
                  <RadixSelect.ItemText>
                    <span className="block truncate">{option.label}</span>
                  </RadixSelect.ItemText>

                  <RadixSelect.ItemIndicator className="flex shrink-0 items-center justify-center">
                    <img
                      src={CheckIcon}
                      alt=""
                      className="h-[13.758px] w-3.5 shrink-0"
                    />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
