import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { ActivityCalendarSection } from "@/features/my/components/ActivityCalendarSection";

import bookmarkIcon from "@/assets/icons/Filledheart.svg";
import profileImage from "@/assets/icons/Profile.svg";
import profileEditIcon from "@/features/my/assets/profileedit.svg";
import settingIcon from "@/features/my/assets/setting.svg";
import { useMyActivitySummaryQuery } from "@/features/my/hooks/useMyActivitiesQuery";
import { useMyPageHomeQuery } from "@/features/my/hooks/useMyPageHomeQuery";

import { SettingsBottomSheet } from "@/features/my/components/SettingsBottomSheet";
import {
  NotificationSettingsSheet,
  type NotificationSettingsView,
} from "@/features/notification/components/NotificationSettingsSheet";

import createCompleteIcon from "@/shared/assets/puzzle/create-complete.svg";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

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

function formatBirthDate(value: string) {
  return value.split("-").join(". ");
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
            <img src={bookmarkIcon} alt="" className="h-[18px] w-5" />
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
        {homeQuery.isPending ? (
          <LoadingState
            label="마이페이지 정보를 불러오는 중이에요."
            className="min-h-70"
          />
        ) : homeQuery.isError ? (
          <ErrorState
            className="min-h-70"
            title="마이페이지 정보를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            primaryAction={{
              label: "다시 시도",
              onClick: () => void homeQuery.refetch(),
            }}
          />
        ) : homeQuery.data ? (
          <>
            <section
              className="mt-3 flex items-center gap-5"
              aria-label="내 프로필"
            >
              <img
                src={homeQuery.data.profileImageUrl || profileImage}
                alt={`${homeQuery.data.nickname} 프로필`}
                className="size-[82px] rounded-full object-cover"
              />
              <div>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={() => navigate("/my/profile/edit")}
                >
                  <span className="text-title-20">
                    {homeQuery.data.nickname}
                  </span>
                  <img src={profileEditIcon} alt="" className="size-[29px]" />
                </button>
                <p className="mt-1 text-body-14 text-text-gray-400">
                  {homeQuery.data.activityRegion?.name ?? "활동 지역 미설정"}
                  <span className="mx-1">·</span>
                  {formatBirthDate(homeQuery.data.birthDate)}
                </p>
              </div>
            </section>

            {activitySummaryQuery.isPending ? (
              <div className="mt-7 flex h-[68px] items-center justify-center rounded-xl border border-stroke bg-white">
                <p className="text-body-14 text-text-gray-400">
                  활동 횟수를 불러오는 중이에요.
                </p>
              </div>
            ) : activitySummaryQuery.isError ? (
              <button
                type="button"
                onClick={() => void activitySummaryQuery.refetch()}
                className="mt-7 flex h-[68px] w-full items-center justify-center rounded-xl border border-stroke bg-white text-body-14 text-text-gray-400"
              >
                활동 횟수를 불러오지 못했어요. 다시 시도
              </button>
            ) : activitySummaryQuery.data ? (
              <button
                type="button"
                className="mt-7 flex h-[68px] w-full items-center rounded-xl border border-stroke bg-white px-5 text-left"
                onClick={() => navigate("/my/activities")}
              >
                <PuzzleMark />
                <span className="ml-3 flex-1 text-body-15-semibold">
                  지금까지 {activitySummaryQuery.data.totalCompletedCount}번
                  함께했어요
                </span>
                <ChevronRight className="size-6 text-text-gray-400" />
              </button>
            ) : null}

            <ActivityCalendarSection />
          </>
        ) : null}
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
