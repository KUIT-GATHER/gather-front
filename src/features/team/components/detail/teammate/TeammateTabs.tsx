import { NavLink } from "react-router";

import { cn } from "@/shared/lib/cn";

type TeammateTabsProps = {
  meetingId: number;
};

const tabs = [
  { label: "모임 홈", suffix: "" },
  { label: "게시판", suffix: "/posts" },
  { label: "나의 활동", suffix: "/activity" },
] as const;

export function TeammateTabs({ meetingId }: TeammateTabsProps) {
  return (
    <nav
      aria-label="모임 상세 메뉴"
      className="sticky top-[calc(env(safe-area-inset-top)+4.375rem)] z-30 grid grid-cols-3 border-b border-stroke bg-bg"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.suffix}
          replace
          to={`/teams/${meetingId}${tab.suffix}`}
          end={tab.suffix === ""}
          className={({ isActive }) =>
            cn(
              "relative flex h-11.5 items-center justify-center text-[16px] leading-5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
              isActive ? "text-text" : "text-text-gray-400",
            )
          }
        >
          {({ isActive }) => (
            <>
              {tab.label}
              {isActive ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-text"
                  aria-hidden="true"
                />
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
