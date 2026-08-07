import { ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";

import type {
  ReviewableActivity,
  ReviewSourceValue,
} from "@/features/team/types/meetingPost.types";
import { cn } from "@/shared/lib/cn";

type ReviewableActivityFieldProps = {
  id: string;
  value: ReviewSourceValue | null;
  activities: ReviewableActivity[];
  invalid?: boolean;
  onChange: (value: ReviewSourceValue) => void;
};

function getReviewSourceValue(activity: ReviewableActivity): ReviewSourceValue {
  return `${activity.reviewSourceType}:${activity.reviewSourceId}`;
}

function formatActivityDate(value: string) {
  return value.slice(0, 10).replaceAll("-", ".");
}

export function ReviewableActivityField({
  id,
  value,
  activities,
  invalid = false,
  onChange,
}: ReviewableActivityFieldProps) {
  return (
    <RadixSelect.Root
      value={value ?? undefined}
      onValueChange={(nextValue) => {
        const activity = activities.find(
          (item) => getReviewSourceValue(item) === nextValue,
        );
        if (activity) onChange(getReviewSourceValue(activity));
      }}
    >
      <RadixSelect.Trigger
        id={id}
        aria-label="후기를 작성할 완료 활동"
        aria-invalid={invalid || undefined}
        className={cn(
          "group flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-[15px] outline-none",
          "focus:border-button focus-visible:ring-2 focus-visible:ring-button/40",
          "data-[state=open]:border-button",
          invalid ? "border-point-red" : "border-stroke",
        )}
      >
        <RadixSelect.Value placeholder="참여한 봉사 목록 확인" />
        <RadixSelect.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-text-gray-300 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-80 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-stroke bg-white shadow-lg"
        >
          <RadixSelect.Viewport className="max-h-80 overflow-y-auto py-1">
            <div className="px-4 py-3 text-sm text-text-gray-300">
              봉사활동을 선택하세요
            </div>
            {activities.map((activity) => {
              const sourceValue = getReviewSourceValue(activity);

              return (
                <RadixSelect.Item
                  key={sourceValue}
                  value={sourceValue}
                  className={cn(
                    "cursor-pointer px-4 py-3 text-[15px] text-text-gray-400 outline-none",
                    "data-[highlighted]:bg-point-green/20 data-[state=checked]:bg-point-green/30",
                  )}
                >
                  <RadixSelect.ItemText>
                    {activity.title} (
                    {formatActivityDate(activity.activityStartAt)})
                  </RadixSelect.ItemText>
                </RadixSelect.Item>
              );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
