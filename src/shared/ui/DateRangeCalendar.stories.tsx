import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

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

const meta = {
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
} satisfies Meta<typeof DateRangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const SelectedRange: Story = {
  args: {
    selected: selectedRange,
  },
};

export const WithSelectablePeriod: Story = {
  args: {
    selected: selectedRange,
    startMonth: addDays(monthStart, -60),
    endMonth: addDays(monthStart, 60),
    disabled: [{ before: addDays(monthStart, 2) }],
  },
};
