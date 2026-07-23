type SharedTab = "home" | "posts" | "myActivity";

type SharedTabsProps = {
  tabs: SharedTab[];
  activeTab: SharedTab;
  onChange: (tab: SharedTab) => void;
};

const TAB_LABELS: Record<SharedTab, string> = {
  home: "모임 홈",
  posts: "게시판",
  myActivity: "나의 활동",
};

export function SharedTabs({ tabs, activeTab, onChange }: SharedTabsProps) {
  return (
    <nav aria-label="모임 상세 메뉴">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-current={activeTab === tab ? "page" : undefined}
          onClick={() => onChange(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </nav>
  );
}
