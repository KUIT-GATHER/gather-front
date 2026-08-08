import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib/cn";

const ITEM_HEIGHT = 40;
const WHEEL_PADDING = 100;

type WheelColumnProps<T extends string | number> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
};

function WheelColumn<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format = String,
}: WheelColumnProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    ref.current?.scrollTo({ top: selectedIndex * ITEM_HEIGHT });
  }, [selectedIndex]);

  return (
    <div className="relative min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        className="h-60 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const index = Math.max(
            0,
            Math.min(
              options.length - 1,
              Math.round(event.currentTarget.scrollTop / ITEM_HEIGHT),
            ),
          );
          const next = options[index];
          if (next !== undefined && next !== value) onChange(next);
        }}
      >
        <div style={{ height: WHEEL_PADDING }} aria-hidden="true" />
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "flex h-10 w-full snap-center items-center justify-center text-xl leading-7 transition",
                selected
                  ? "font-semibold text-text"
                  : "font-medium text-text-gray-100",
              )}
              onClick={() => onChange(option)}
            >
              {format(option)}
            </button>
          );
        })}
        <div style={{ height: WHEEL_PADDING }} aria-hidden="true" />
      </div>
    </div>
  );
}

type TimeWheelPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const meridiems = ["AM", "PM"] as const;
const hours = Array.from({ length: 12 }, (_, index) => index + 1);
const minutes = Array.from({ length: 60 }, (_, index) => index);

export function TimeWheelPicker({ value, onChange }: TimeWheelPickerProps) {
  const hour24 = value.getHours();
  const meridiem = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 || 12;
  const minute = value.getMinutes();

  const update = (
    nextMeridiem: "AM" | "PM",
    nextHour: number,
    nextMinute: number,
  ) => {
    const next = new Date(value);
    const nextHour24 = (nextHour % 12) + (nextMeridiem === "PM" ? 12 : 0);
    next.setHours(nextHour24, nextMinute, 0, 0);
    onChange(next);
  };

  return (
    <div className="relative h-[243px] overflow-hidden rounded-2xl border border-button bg-white px-4">
      <div className="pointer-events-none absolute inset-x-4 top-1/2 z-0 h-12 -translate-y-1/2 rounded-xl bg-stroke" />
      <div className="relative z-10 grid grid-cols-3 gap-3">
        <WheelColumn
          label="오전 오후"
          options={meridiems}
          value={meridiem}
          format={(item) => (item === "AM" ? "오전" : "오후")}
          onChange={(next) => update(next, hour12, minute)}
        />
        <WheelColumn
          label="시간"
          options={hours}
          value={hour12}
          onChange={(next) => update(meridiem, next, minute)}
        />
        <WheelColumn
          label="분"
          options={minutes}
          value={minute}
          format={(item) => String(item).padStart(2, "0")}
          onChange={(next) => update(meridiem, hour12, next)}
        />
      </div>
    </div>
  );
}
