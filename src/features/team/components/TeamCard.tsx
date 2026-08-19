import { Settings } from "lucide-react";

import { ActivityListCard } from "@/features/activity/components/ActivityListCard";
import { MeetingCover } from "@/features/team/components/MeetingCover";
import {
  formatMeetingActivityDate,
  getMeetingDDay,
} from "@/features/team/lib/teamFormatters";
import type {
  MeetingListItem,
  MeetingMemberRole,
} from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type TeamCardProps = {
  team: Omit<MeetingListItem, "regionName"> & { regionName?: string | null };
  onClick: () => void;
  onSettingsClick?: () => void;
  variant?: "list" | "compact" | "my";
  viewerRole?: MeetingMemberRole;
  imageLoading?: "eager" | "lazy";
};

export function TeamCard({
  team,
  onClick,
  onSettingsClick,
  variant = "list",
  viewerRole,
  imageLoading,
}: TeamCardProps) {
  const deadlineDate = formatMeetingActivityDate(team.deadline);
  const deadline = getMeetingDDay(team.deadline);
  const urgentDeadline =
    deadline === "D-day" || /^D-[1-7]$/.test(deadline ?? "") ? deadline : null;
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-[193px] shrink-0 rounded-xl border border-[#c5c5c5] bg-white p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <MeetingCover
          imageUrl={team.thumbnailUrl}
          loading={imageLoading}
          className="h-[202px] w-[167px] rounded-[10px]"
        />
        <div className="mt-2.5">
          <h3 className="truncate text-body-15-semibold text-text">
            {team.name}
          </h3>
          {team.description ? (
            <p className="mt-[3px] truncate text-sm font-medium leading-4 text-text-gray-400">
              {team.description}
            </p>
          ) : null}
          <p className="mt-[3px] truncate text-sm leading-4 text-text-gray-100">
            {team.regionName ? `${team.regionName} \u00b7 ` : ""}
            {team.currentMemberCount}/{team.maxMember}명
            {deadlineDate ? ` · ${deadlineDate}` : ""}
          </p>
        </div>
      </button>
    );
  }

  if (variant === "my") {
    return (
      <article className="relative overflow-hidden rounded-xl border border-stroke bg-white">
        <button
          type="button"
          onClick={onClick}
          className="block w-full p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        >
          <MeetingCover
            imageUrl={team.thumbnailUrl}
            loading={imageLoading}
            className="h-[136px] w-full rounded-[10px]"
          />

          <div className="mt-2.5 min-w-0 pr-16">
            <h2 className="truncate text-lg font-semibold leading-5 text-text">
              {team.name}
            </h2>
            {team.description ? (
              <p className="mt-1 truncate text-sm leading-4 text-text-gray-400">
                {team.description}
              </p>
            ) : null}
            <p className="mt-1 truncate text-sm leading-4 text-text-gray-400">
              {team.regionName ? `${team.regionName} · ` : ""}
              {team.currentMemberCount}/{team.maxMember}명
              {deadlineDate ? ` · ${deadlineDate}` : ""}
            </p>
          </div>
        </button>

        {viewerRole ? (
          <div className="absolute top-[158px] right-3 flex items-center gap-2">
            <span
              className={cn(
                "rounded-lg px-2 py-1 text-xs leading-4 font-medium",
                viewerRole === "HOST"
                  ? "bg-text-gray-400 text-white"
                  : "border border-text-gray-300 bg-white text-text-gray-300",
              )}
            >
              {viewerRole === "HOST" ? "팀장" : "팀원"}
            </span>

            {viewerRole === "HOST" ? (
              <button
                type="button"
                aria-label="모임 설정"
                title="모임 설정"
                className="grid size-7 place-items-center text-text-gray-300"
                onClick={onSettingsClick}
              >
                <Settings className="size-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <ActivityListCard
      image={
        <MeetingCover
          imageUrl={team.thumbnailUrl}
          loading={imageLoading}
          className="h-[106px] w-[91px] shrink-0 rounded-[10px]"
        />
      }
      title={team.name}
      description={team.description}
      metadata={[
        team.regionName,
        `${team.currentMemberCount}/${team.maxMember}명`,
        deadlineDate,
      ]}
      dDay={urgentDeadline}
      categories={team.categories}
      onClick={onClick}
    />
  );
}
