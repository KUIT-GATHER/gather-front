import { NavLink, Outlet } from "react-router";

import { cn } from "@/shared/lib/cn";

import HomeOnIcon from "@/assets/icons/HomeOn.svg";
import HomeOffIcon from "@/assets/icons/HomeOff.svg";
import MeetingOnIcon from "@/assets/icons/MeetingOn.svg";
import MeetingOffIcon from "@/assets/icons/MeetingOff.svg";
import MyOnIcon from "@/assets/icons/MyOn.svg";
import MyOffIcon from "@/assets/icons/MyOff.svg";

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

export function MainTabLayout() {
  return (
    <>
      <main className="pb-[80px]">
        <Outlet />
      </main>

      <nav
        className={cn(
          "fixed bottom-0 left-1/2 z-30",
          "flex h-[80px] w-full max-w-[402px] -translate-x-1/2 items-center justify-center",
          "border-t border-[#ECECEC] bg-white",
          "px-[43px] pt-[17px] pb-[23px]",
        )}
        aria-label="하단 내비게이션"
      >
        <div className="flex items-center gap-[92px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-[4px]",
                  "text-[14px] font-medium leading-none",
                  isActive ? "text-button" : "text-text-gray-100",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? item.onIcon : item.offIcon}
                    alt=""
                    className="h-[26px] w-[26px]"
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
