import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { DayPicker, type DayButtonProps } from "@daypicker/react";
import { ko } from "@daypicker/react/locale/ko";

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
  return (
    <DayPicker
      mode="single"
      locale={ko}
      selected={selected}
      defaultMonth={selected}
      disabled={{ before: startOfToday() }}
      onSelect={(date) => {
        if (date) onSelect(date);
      }}
      navLayout="around"
      formatters={{
        formatCaption: (month) =>
          `${month.getFullYear()}.${month.getMonth() + 1}`,
      }}
      components={{ DayButton: CalendarDayButton }}
      className={cn("w-full", className)}
      style={calendarStyle}
      classNames={{
        root: "rdp-root w-full",
        months: "rdp-months block w-full max-w-none",
        month: "rdp-month w-full",
        month_caption:
          "rdp-month_caption h-14 items-center justify-center text-xl font-semibold text-text-gray-400",
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
        button_previous: cn(
          "rdp-button_previous !absolute !top-1.5 !left-[68px] size-11 rounded-full text-button",
          "hover:bg-text/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        ),
        button_next: cn(
          "rdp-button_next !absolute !top-1.5 !right-[68px] size-11 rounded-full text-button",
          "hover:bg-text/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        ),
        outside: "rdp-outside text-text-gray-100 opacity-100",
        disabled: "rdp-disabled text-text-gray-100 opacity-60",
        today: "rdp-today",
        selected: "rdp-selected",
      }}
    />
  );
}
