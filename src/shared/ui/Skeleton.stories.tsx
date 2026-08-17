import preview from "../../../.storybook/preview";

import Skeleton from "./Skeleton";

const meta = preview.meta({
  title: "Shared/UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    children: { control: false },
  },
});

export const Card = meta.story({
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
});

export const TextLines = meta.story({
  render: () => (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
});
