import type { CSSProperties } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { ko } from "@daypicker/react/locale/ko";

import "@daypicker/react/style.css";

import { cn } from "@/shared/lib/cn";

type DateRangeCalendarProps = {
  selected?: DateRange;
  defaultMonth?: Date;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
};

const calendarStyle = {
  "--rdp-accent-color": "var(--color-button)",
  "--rdp-accent-background-color":
    "color-mix(in srgb, var(--color-button) 16%, transparent)",
  "--rdp-range_middle-background-color":
    "color-mix(in srgb, var(--color-button) 16%, transparent)",
  "--rdp-range_start-date-background-color": "var(--color-bg)",
  "--rdp-range_end-date-background-color": "var(--color-bg)",
  "--rdp-range_start-color": "var(--color-icon)",
  "--rdp-range_end-color": "var(--color-icon)",
  "--rdp-selected-border": "0",
} as CSSProperties;

export default function DateRangeCalendar({
  selected,
  defaultMonth,
  onSelect,
  className,
}: DateRangeCalendarProps) {
  return (
    <DayPicker
      mode="range"
      locale={ko}
      selected={selected}
      defaultMonth={defaultMonth}
      onSelect={onSelect}
      navLayout="around"
      numberOfMonths={1}
      formatters={{
        formatCaption: (month) =>
          `${month.getFullYear()}.${month.getMonth() + 1}`,
      }}
      className={cn("w-full", className)}
      style={calendarStyle}
      classNames={{
        root: "rdp-root w-full",
        months: "rdp-months block w-full max-w-none",
        month: "rdp-month w-full",
        month_caption:
          "rdp-month_caption h-12 items-center justify-center text-title-18 text-text",
        month_grid:
          "rdp-month_grid w-full table-fixed border-collapse [&_tr>th:first-child]:text-point-red [&_tr>td:first-child]:text-point-red",
        weekdays: "rdp-weekdays",
        weekday: "rdp-weekday h-10 text-center text-body-14-semibold text-text",
        week: "rdp-week h-11",
        day: "rdp-day h-11 p-0 text-center text-body-14 text-text",
        day_button: cn(
          "rdp-day_button mx-auto size-10 rounded-xl border-0 text-body-14",
          "hover:bg-button/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        ),
        button_previous: cn(
          "rdp-button_previous size-11 rounded-full text-button",
          "hover:bg-text/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        ),
        button_next: cn(
          "rdp-button_next size-11 rounded-full text-button",
          "hover:bg-text/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        ),
        outside: "rdp-outside text-text-gray-100",
        today: "rdp-today font-semibold text-text",
        selected: "rdp-selected !text-body-14 !font-normal",
        range_middle:
          "rdp-range_middle bg-button/15 [&>.rdp-day_button]:rounded-none [&>.rdp-day_button]:bg-transparent [&>.rdp-day_button]:!text-body-14 [&>.rdp-day_button]:!font-normal",
        range_start:
          "rdp-range_start bg-button/15 [&>.rdp-day_button]:rounded-xl [&>.rdp-day_button]:bg-bg [&>.rdp-day_button]:text-icon [&>.rdp-day_button]:shadow-md [&>.rdp-day_button]:!text-body-14 [&>.rdp-day_button]:!font-normal",
        range_end:
          "rdp-range_end bg-button/15 [&>.rdp-day_button]:rounded-xl [&>.rdp-day_button]:bg-bg [&>.rdp-day_button]:text-icon [&>.rdp-day_button]:shadow-md [&>.rdp-day_button]:!text-body-14 [&>.rdp-day_button]:!font-normal",
      }}
    />
  );
}
