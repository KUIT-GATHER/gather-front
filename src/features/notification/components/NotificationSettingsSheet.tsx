import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";

import { useUpdateNotificationSettingsMutation } from "@/features/notification/hooks/useNotificationMutations";
import { useNotificationSettingsQuery } from "@/features/notification/hooks/useNotificationSettingsQuery";
import type { NotificationSettings } from "@/features/notification/types/notification.types";
import BottomSheet from "@/shared/ui/BottomSheet";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import Switch from "@/shared/ui/Switch";

export type NotificationSettingsView = "menu" | "activity" | "meeting";
type SettingsField = keyof NotificationSettings;

const activitySettings: ReadonlyArray<{
  field: SettingsField;
  label: string;
}> = [
  { field: "volunteerScheduleEnabled", label: "봉사 일정 알림" },
  {
    field: "bookmarkedPostingDeadlineEnabled",
    label: "북마크한 공고 모집 마감 임박 알림",
  },
  { field: "badgeEnabled", label: "활동 뱃지 획득 알림" },
  { field: "activityPostCommentEnabled", label: "작성 글 댓글 알림" },
];

const meetingSettings: ReadonlyArray<{
  field: SettingsField;
  label: string;
}> = [
  { field: "meetingJoinResultEnabled", label: "모임 승인/거절 알림" },
  {
    field: "bookmarkedMeetingDeadlineEnabled",
    label: "북마크한 모임 모집 마감 임박 알림",
  },
  { field: "meetingPostCommentEnabled", label: "작성 글 댓글 알림" },
];

type NotificationSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: NotificationSettingsView;
  onBack?: () => void;
};

function SettingsMenu({
  onChangeView,
}: {
  onChangeView: (view: NotificationSettingsView) => void;
}) {
  return (
    <section>
      <h2 className="text-body-15-semibold text-text">알림</h2>
      <div className="mt-2 divide-y divide-stroke/70">
        <button
          type="button"
          className="flex min-h-13 w-full items-center justify-between py-3 text-left text-body-14 text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => onChangeView("activity")}
        >
          봉사 활동
          <ChevronRight
            className="size-5 text-text-gray-300"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="flex min-h-13 w-full items-center justify-between py-3 text-left text-body-14 text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => onChangeView("meeting")}
        >
          모임 활동
          <ChevronRight
            className="size-5 text-text-gray-300"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}

function SettingsDetail({
  settings,
  fields,
}: {
  settings: NotificationSettings;
  fields: ReadonlyArray<{ field: SettingsField; label: string }>;
}) {
  const idPrefix = useId();
  const updateMutation = useUpdateNotificationSettingsMutation();

  const updateSetting = (field: SettingsField, checked: boolean) => {
    const nextSettings: NotificationSettings = {
      ...settings,
      [field]: checked,
    };

    updateMutation.mutate(nextSettings);
  };

  return (
    <section className="space-y-1">
      {updateMutation.isError ? (
        <p role="alert" className="mb-3 text-body-14 text-point-red">
          설정을 저장하지 못했어요. 다시 시도해 주세요.
        </p>
      ) : null}
      {fields.map(({ field, label }) => {
        const id = `${idPrefix}-${field}`;

        return (
          <div
            key={field}
            className="flex min-h-13 items-center justify-between gap-4 py-2"
          >
            <label htmlFor={id} className="text-body-14 text-text">
              {label}
            </label>
            <Switch
              id={id}
              checked={settings[field]}
              disabled={updateMutation.isPending}
              onCheckedChange={(checked) => updateSetting(field, checked)}
            />
          </div>
        );
      })}
    </section>
  );
}

export function NotificationSettingsSheet({
  open,
  onOpenChange,
  initialView = "menu",
  onBack,
}: NotificationSettingsSheetProps) {
  const [view, setView] = useState<NotificationSettingsView>(initialView);
  const settingsQuery = useNotificationSettingsQuery(open);

  const closeSheet = (nextOpen: boolean) => {
    if (!nextOpen) {
      setView(initialView);
    }

    onOpenChange(nextOpen);
  };

  const isDetailView = view === "activity" || view === "meeting";
  const title =
    view === "activity" ? "봉사활동" : view === "meeting" ? "모임활동" : "설정";

  return (
    <BottomSheet
      open={open}
      onOpenChange={closeSheet}
      title={title}
      onBack={isDetailView ? (onBack ?? (() => setView("menu"))) : undefined}
      className={
        isDetailView ? "h-[min(78dvh,42rem)]" : "max-h-[min(45dvh,24rem)]"
      }
    >
      {view === "menu" ? <SettingsMenu onChangeView={setView} /> : null}

      {isDetailView && settingsQuery.isLoading ? (
        <LoadingState label="알림 설정을 불러오는 중" className="min-h-40" />
      ) : null}

      {isDetailView && settingsQuery.isError ? (
        <ErrorState
          title="알림 설정을 불러오지 못했어요"
          description="잠시 후 다시 확인해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void settingsQuery.refetch();
            },
          }}
          className="py-8"
        />
      ) : null}

      {isDetailView && settingsQuery.data ? (
        <SettingsDetail
          settings={settingsQuery.data}
          fields={view === "activity" ? activitySettings : meetingSettings}
        />
      ) : null}
    </BottomSheet>
  );
}
