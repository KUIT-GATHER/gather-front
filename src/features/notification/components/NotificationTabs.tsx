import { cn } from "@/shared/lib/cn";

import type { NotificationCategory } from "@/features/notification/types/notification.types";

const tabs: ReadonlyArray<{ value: NotificationCategory; label: string }> = [
  { value: "ACTIVITY", label: "활동" },
  { value: "MEETING", label: "모임" },
];

type NotificationTabsProps = {
  category: NotificationCategory;
  onChange: (category: NotificationCategory) => void;
};

export function NotificationTabs({
  category,
  onChange,
}: NotificationTabsProps) {
  return (
    <div
      className="-mx-5.5 grid h-12 grid-cols-2 border-b border-stroke"
      role="tablist"
      aria-label="알림 카테고리"
    >
      {tabs.map((tab) => {
        const isActive = category === tab.value;

        return (
          <button
            key={tab.value}
            id={`notification-tab-${tab.value.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="notification-list"
            className={cn(
              "relative text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
              isActive ? "font-semibold text-text" : "text-text-gray-400",
            )}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-[-1px] h-px bg-text"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
