import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import type { ReviewableActivity } from "@/features/team/types/meetingPost.types";

interface ActivitySelectDropdownProps {
  activities: ReviewableActivity[];
  selectedActivity: ReviewableActivity | null;
  error?: string;
  onSelect: (activity: ReviewableActivity) => void;
}
function formatActivityDate(activityStartAt: string) {
  return activityStartAt.slice(0, 10);
}
export function ActivitySelectDropdown({
  activities,
  selectedActivity,
  error,
  onSelect,
}: ActivitySelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-30">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          error ? "border-point-red" : "border-stroke",
        )}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        <span
          className={cn(
            "truncate text-[14px]",
            selectedActivity ? "text-text" : "text-text-gray-400",
          )}
        >
          {selectedActivity
            ? `${selectedActivity.title} (${formatActivityDate(
                selectedActivity.activityStartAt,
              )})`
            : "참여한 봉사 목록 확인"}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="참여한 봉사 목록"
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-40 overflow-hidden rounded-xl border border-stroke bg-white"
        >
          <div className="border-stroke/70 px-4 py-3 text-[13px] text-text-gray-400">
            봉사활동을 선택하세요
          </div>

          {activities.length === 0 ? (
            <p className="px-4 py-5 text-center text-[13px] text-text-gray-400">
              선택할 수 있는 완료된 봉사활동이 없어요.
            </p>
          ) : (
            <ul className="max-h-60 overflow-y-auto py-1">
              {activities.map((activity) => {
                const isSelected =
                  selectedActivity?.reviewSourceType ===
                    activity.reviewSourceType &&
                  selectedActivity?.reviewSourceId === activity.reviewSourceId;

                return (
                  <li
                    key={`${activity.reviewSourceType}:${activity.reviewSourceId}`}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-center px-4 py-3 text-left text-[13px] transition-colors",
                        isSelected
                          ? "bg-[#90D79D52] text-text"
                          : "bg-white text-text-gray-400 hover:bg-[#90D79D52]",
                      )}
                      onClick={() => {
                        onSelect(activity);
                        setIsOpen(false);
                      }}
                    >
                      {activity.title} (
                      {formatActivityDate(activity.activityStartAt)})
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] text-point-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
