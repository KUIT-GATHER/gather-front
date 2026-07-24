import { cn } from "@/shared/lib/cn";

export type GuestTab = "home" | "posts";

type GuestTabsProps = {
  activeTab: GuestTab;
  onChange: (tab: GuestTab) => void;
};

const tabs = [
  { value: "home", label: "모임 홈" },
  { value: "posts", label: "게시판" },
] as const;

export function GuestTabs({ activeTab, onChange }: GuestTabsProps) {
  return (
    <nav
      aria-label="모임 상세 메뉴"
      className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 grid grid-cols-2 border-b border-stroke bg-bg"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-current={activeTab === tab.value ? "page" : undefined}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative h-11.5 text-[16px] leading-5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
            activeTab === tab.value ? "text-text" : "text-text-gray-400",
          )}
        >
          {tab.label}
          {activeTab === tab.value ? (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 bg-text"
              aria-hidden="true"
            />
          ) : null}
        </button>
      ))}
    </nav>
  );
}
