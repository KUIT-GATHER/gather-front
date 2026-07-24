import { cn } from "@/shared/lib/cn";

type TeammateTab = "home" | "posts" | "myActivity";

type TeammateTabsProps = {
  tabs: TeammateTab[];
  activeTab: TeammateTab;
  onChange: (tab: TeammateTab) => void;
};

const TAB_LABELS: Record<TeammateTab, string> = {
  home: "모임 홈",
  posts: "게시판",
  myActivity: "나의 활동",
};

export type { TeammateTab };

export function TeammateTabs({ tabs, activeTab, onChange }: TeammateTabsProps) {
  return (
    <nav
      aria-label="모임 상세 메뉴"
      className={cn(
        "sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 grid border-b border-stroke bg-bg",
        tabs.length === 3 ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-current={activeTab === tab ? "page" : undefined}
          onClick={() => onChange(tab)}
          className={cn(
            "relative h-11.5 text-[16px] leading-5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
            activeTab === tab ? "text-text" : "text-text-gray-400",
          )}
        >
          {TAB_LABELS[tab]}
          {activeTab === tab ? (
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
