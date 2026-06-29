import { useState } from "react";
import { cn } from "@/shared/lib/cn";

import HomeOnIcon from "@/assets/icons/HomeOn.svg";
import HomeOffIcon from "@/assets/icons/HomeOff.svg";
import MeetingOnIcon from "@/assets/icons/MeetingOn.svg";
import MeetingOffIcon from "@/assets/icons/MeetingOff.svg";
import MyOnIcon from "@/assets/icons/MyOn.svg";
import MyOffIcon from "@/assets/icons/MyOff.svg";

type BottomNavValue = "home" | "meeting" | "my";

const navItems = [
  {
    label: "홈",
    value: "home",
    onIcon: HomeOnIcon,
    offIcon: HomeOffIcon,
  },
  {
    label: "모임",
    value: "meeting",
    onIcon: MeetingOnIcon,
    offIcon: MeetingOffIcon,
  },
  {
    label: "마이",
    value: "my",
    onIcon: MyOnIcon,
    offIcon: MyOffIcon,
  },
] as const;

export default function BottomNav() {
  const [active, setActive] = useState<BottomNavValue>("home");

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-30",
        "flex h-[80px] w-full max-w-[402px] -translate-x-1/2 items-center justify-center",
        "border-t border-[#ECECEC] bg-white",
        "px-[43px] pt-[17px] pb-[23px]"
      )}
    >
      <div className="flex items-center gap-[92px]">
        {navItems.map((item) => {
          const isActive = active === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setActive(item.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-[4px]",
                "text-[14px] font-medium leading-none",
                isActive ? "text-button" : "text-text-gray-100"
              )}
            >
              <img
                src={isActive ? item.onIcon : item.offIcon}
                alt=""
                className="h-[26px] w-[26px]"
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}