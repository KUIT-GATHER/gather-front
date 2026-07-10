import { NavLink } from "react-router";

import HomeOnIcon from "@/assets/icons/HomeOn.svg";
import HomeOffIcon from "@/assets/icons/HomeOff.svg";
import MeetingOnIcon from "@/assets/icons/MeetingOn.svg";
import MeetingOffIcon from "@/assets/icons/MeetingOff.svg";
import MyOnIcon from "@/assets/icons/MyOn.svg";
import MyOffIcon from "@/assets/icons/MyOff.svg";
import { cn } from "@/shared/lib/cn";

const navItems = [
  {
    label: "홈",
    to: "/home",
    onIcon: HomeOnIcon,
    offIcon: HomeOffIcon,
  },
  {
    label: "모임",
    to: "/teams",
    onIcon: MeetingOnIcon,
    offIcon: MeetingOffIcon,
  },
  {
    label: "마이",
    to: "/my",
    onIcon: MyOnIcon,
    offIcon: MyOffIcon,
  },
] as const;

export function MobileBottomNavigation() {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-30",
        "w-full max-w-app -translate-x-1/2",
        "border-t border-[#ECECEC] bg-white",
      )}
      aria-label="하단 내비게이션"
    >
      <div className="grid h-20 grid-cols-3 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1",
                "text-sm font-medium leading-none",
                isActive ? "text-button" : "text-text-gray-100",
              )
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? item.onIcon : item.offIcon}
                  alt=""
                  className="h-6.5 w-6.5"
                  aria-hidden="true"
                />

                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" aria-hidden="true" />
    </nav>
  );
}
