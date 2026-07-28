import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from "react";
import { DayPicker, type DayButtonProps } from "@daypicker/react";
import { ko } from "@daypicker/react/locale/ko";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "@daypicker/react/style.css";

import { cn } from "@/shared/lib/cn";

type SingleDateCalendarProps = {
  selected: Date;
  onSelect: (date: Date) => void;
  className?: string;
};

const calendarStyle = {
  "--rdp-accent-color": "var(--color-button)",
  "--rdp-accent-background-color": "var(--color-button)",
} as CSSProperties;

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function CalendarDayButton({
  day,
  modifiers,
  children,
  className,
  ...buttonProps
}: DayButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-date={day.isoDate}
      className={cn(
        className,
        modifiers.selected &&
          "!h-[47px] !w-[49px] !rounded-[6px] !border-0 !bg-button !font-normal",
      )}
      {...buttonProps}
    >
      <span className={modifiers.selected ? "!text-white" : undefined}>
        {children}
      </span>
      {modifiers.today ? (
        <span
          className={cn(
            "text-[10px] leading-3",
            modifiers.selected && "!text-white",
          )}
        >
          오늘
        </span>
      ) : null}
    </button>
  );
}

export function SingleDateCalendar({
  selected,
  onSelect,
  className,
}: SingleDateCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  useEffect(() => {
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected]);

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-12">
        <button
          type="button"
          aria-label="이전 달"
          className="flex size-11 items-center justify-center justify-self-start rounded-full text-button hover:bg-button/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => moveMonth(-1)}
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-8"
            strokeWidth={2.5}
          />
        </button>
        <p
          className="min-w-28 text-center text-xl font-semibold text-text-gray-400"
          aria-live="polite"
        >
          {visibleMonth.getFullYear()}.{visibleMonth.getMonth() + 1}
        </p>
        <button
          type="button"
          aria-label="다음 달"
          className="flex size-11 items-center justify-center justify-self-end rounded-full text-button hover:bg-button/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => moveMonth(1)}
        >
          <ChevronRight
            aria-hidden="true"
            className="size-8"
            strokeWidth={2.5}
          />
        </button>
      </div>
      <DayPicker
        mode="single"
        locale={ko}
        selected={selected}
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        hideNavigation
        disabled={{ before: startOfToday() }}
        onSelect={(date) => {
          if (date) onSelect(date);
        }}
        formatters={{
          formatCaption: (month) =>
            `${month.getFullYear()}.${month.getMonth() + 1}`,
        }}
        components={{ DayButton: CalendarDayButton }}
        className="w-full"
        style={calendarStyle}
        classNames={{
          root: "rdp-root w-full",
          months: "rdp-months block w-full max-w-none",
          month: "rdp-month w-full",
          month_caption: "sr-only",
          month_grid:
            "rdp-month_grid w-full table-fixed border-collapse [&_tr>th:first-child]:text-point-red [&_tr>td:first-child]:text-point-red",
          weekdays: "rdp-weekdays",
          weekday:
            "rdp-weekday h-9 p-0 text-center text-body-14 text-text-gray-300 opacity-100",
          week: "rdp-week h-[47px]",
          day: "rdp-day h-[47px] w-auto p-0 text-center text-body-14 text-text",
          day_button: cn(
            "rdp-day_button relative mx-auto flex h-[47px] w-full flex-col rounded-md border-0 text-body-14 leading-5",
            "hover:bg-button/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          ),
          outside: "rdp-outside text-text-gray-100 opacity-100",
          disabled: "rdp-disabled text-text-gray-100 opacity-60",
          today: "rdp-today",
          selected: "rdp-selected",
        }}
      />
    </div>
  );
}
