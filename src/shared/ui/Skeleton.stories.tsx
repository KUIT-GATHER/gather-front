import type { Meta, StoryObj } from "@storybook/react-vite";

import Skeleton from "./Skeleton";

const meta = {
  title: "Shared/UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  render: () => (
    <div className="flex w-full max-w-[360px] gap-4 rounded-xl border border-stroke bg-white p-4">
      <Skeleton className="size-20 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 py-1">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
};
