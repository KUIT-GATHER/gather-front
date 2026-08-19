import preview from "../../../.storybook/preview";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import DateRangeCalendar from "./DateRangeCalendar";

type DateRangeCalendarStoryProps = ComponentProps<typeof DateRangeCalendar>;

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

const monthStart = getMonthStart(new Date());
const selectedRange = {
  from: addDays(monthStart, 4),
  to: addDays(monthStart, 9),
};

function InteractiveCalendar(args: DateRangeCalendarStoryProps) {
  const [selected, setSelected] = useState(args.selected);

  return (
    <div className="w-[360px]">
      <DateRangeCalendar
        {...args}
        selected={selected}
        onSelect={(nextRange) => {
          args.onSelect(nextRange);
          setSelected(nextRange);
        }}
      />
    </div>
  );
}

const meta = preview.meta({
  title: "Shared/UI/DateRangeCalendar",
  component: DateRangeCalendar,
  parameters: {
    layout: "centered",
  },
  args: {
    defaultMonth: monthStart,
    onSelect: fn(),
  },
  argTypes: {
    selected: { control: false },
    defaultMonth: { control: false },
    startMonth: { control: false },
    endMonth: { control: false },
    disabled: { control: false },
    onSelect: { control: false },
  },
  render: (args) => <InteractiveCalendar {...args} />,
});

export const Empty = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedDate = addDays(monthStart, 14);
    const dateLabel = new RegExp(
      `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`,
    );
    const dateButton = canvas.getByRole("button", { name: dateLabel });

    await userEvent.click(dateButton);

    await expect(
      canvas.getByRole("gridcell", { name: String(selectedDate.getDate()) }),
    ).toHaveAttribute("aria-selected", "true");
  },
});

export const SelectedRange = meta.story({
  args: {
    selected: selectedRange,
  },
});

export const WithSelectablePeriod = meta.story({
  args: {
    selected: selectedRange,
    startMonth: addDays(monthStart, -60),
    endMonth: addDays(monthStart, 60),
    disabled: [{ before: addDays(monthStart, 2) }],
  },
});
