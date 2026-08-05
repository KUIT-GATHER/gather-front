import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { ActivityCalendarSection } from "@/features/my/components/ActivityCalendarSection";

import bookmarkIcon from "@/features/my/assets/bookmark.svg";
import profileImage from "@/features/my/assets/profile.png";
import profileEditIcon from "@/features/my/assets/profileedit.svg";
import settingIcon from "@/features/my/assets/setting.svg";
import { useMyPageHomeQuery } from "@/features/my/hooks/useMyPageHomeQuery";
import { useMyActivitySummaryQuery } from "@/features/my/hooks/useMyActivitiesQuery";

import { SettingsBottomSheet } from "@/features/my/components/SettingsBottomSheet";
import {
  NotificationSettingsSheet,
  type NotificationSettingsView,
} from "@/features/notification/components/NotificationSettingsSheet";

import createCompleteIcon from "@/shared/assets/puzzle/create-complete.svg";

function PuzzleMark() {
  return (
    <img
      src={createCompleteIcon}
      alt=""
      aria-hidden="true"
      className="h-12 w-12 shrink-0 -rotate-[-15.95deg] object-contain"
    />
  );
}
export function MyPageScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(
    () => searchParams.get("settings") === "open",
  );
  const [notificationSettingsView, setNotificationSettingsView] =
    useState<Exclude<NotificationSettingsView, "menu"> | null>(null);
  const homeQuery = useMyPageHomeQuery();
  const activitySummaryQuery = useMyActivitySummaryQuery();
  const home = homeQuery.data;
  const completedActivityCount =
    activitySummaryQuery.data?.timeCertifiableCompletedCount ?? 0;
  const displayName = home?.nickname ?? "";
  const profileDetails = [
    home?.activityRegion?.name,
    home?.birthDate.split("-").join(". "),
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSettingsOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (!open && searchParams.get("settings") === "open") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("settings");
      setSearchParams(nextParams, { replace: true });
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100dvh-5rem)] max-w-app bg-bg">
      <header className="flex h-[70px] items-center justify-between px-5.5">
        <h1 className="text-title-20">마이페이지</h1>
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="찜한 활동 보기"
            className="p-0.5"
            onClick={() => navigate("/my/bookmarks")}
          >
            <img src={bookmarkIcon} alt="" className="h-[18px] w-3.5" />
          </button>
          <button
            type="button"
            aria-label="설정"
            className="p-0.5"
            onClick={() => setSettingsOpen(true)}
          >
            <img src={settingIcon} alt="" className="size-6" />
          </button>
        </div>
      </header>

      <main className="px-5.5 pb-6">
        <section
          className="mt-3 flex items-center gap-5"
          aria-label="내 프로필"
        >
          <img
            src={home?.profileImageUrl || profileImage}
            alt={`${displayName} 프로필`}
            className="size-[82px] rounded-full object-cover"
          />
          <div>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => navigate("/my/profile/edit")}
            >
              <span className="text-title-20">{displayName}</span>
              <img src={profileEditIcon} alt="" className="size-[29px]" />
            </button>
            <p className="mt-1 text-body-14 text-text-gray-400">
              {profileDetails}
            </p>
          </div>
        </section>

        <button
          type="button"
          className="mt-7 flex h-[68px] w-full items-center rounded-xl border border-stroke bg-white px-5 text-left"
          onClick={() => navigate("/my/activities")}
        >
          <PuzzleMark />
          <span className="ml-3 flex-1 text-body-15-semibold">
            지금까지 {completedActivityCount}번 함께했어요
          </span>
          <ChevronRight className="size-6 text-text-gray-400" />
        </button>

        <ActivityCalendarSection />
      </main>
      <SettingsBottomSheet
        open={settingsOpen}
        onOpenChange={handleSettingsOpenChange}
        onOpenNotificationSettings={(view) => {
          handleSettingsOpenChange(false);
          setNotificationSettingsView(view);
        }}
      />
      {notificationSettingsView ? (
        <NotificationSettingsSheet
          key={notificationSettingsView}
          open
          initialView={notificationSettingsView}
          onBack={() => {
            setNotificationSettingsView(null);
            setSettingsOpen(true);
          }}
          onOpenChange={(open) => {
            if (!open) setNotificationSettingsView(null);
          }}
        />
      ) : null}
    </div>
  );
}
