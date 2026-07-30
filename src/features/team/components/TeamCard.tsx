import { Settings } from "lucide-react";

import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import {
  formatMeetingActivityDate,
  getMeetingDDay,
} from "@/features/team/lib/teamFormatters";
import { getMeetingImage } from "@/features/team/lib/getMeetingImage";
import type {
  MeetingListItem,
  MeetingMemberRole,
} from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type TeamCardProps = {
  team: MeetingListItem;
  onClick: () => void;
  variant?: "list" | "compact" | "my";
  regionName?: string | null;
  viewerRole?: MeetingMemberRole;
};

export function TeamCard({
  team,
  onClick,
  variant = "list",
  regionName,
  viewerRole,
}: TeamCardProps) {
  const deadlineDate = formatMeetingActivityDate(team.deadline);
  const deadline = getMeetingDDay(team.deadline);
  const urgentDeadline =
    deadline === "D-day" || /^D-[1-7]$/.test(deadline ?? "") ? deadline : null;
  const imageSrc = getMeetingImage(team.categories[0], team.meetingId);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-[193px] shrink-0 rounded-xl border border-[#c5c5c5] bg-white p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <img
          src={imageSrc}
          alt=""
          className="h-[202px] w-[167px] rounded-[10px] object-cover"
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
            {regionName ? `${regionName} \u00b7 ` : ""}
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
          <img
            src={imageSrc}
            alt=""
            className="h-[136px] w-full rounded-[10px] object-cover"
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
              {regionName ? `${regionName} · ` : ""}
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
                disabled
                aria-label="모임 설정 준비 중"
                title="모임 설정은 준비 중입니다."
                className="grid size-7 place-items-center text-text-gray-300 disabled:cursor-not-allowed"
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
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-stroke bg-white px-3 py-4 text-left transition-colors duration-200 hover:border-point-green hover:bg-[#f0f6f0] active:border-point-green active:bg-[#f0f6f0] focus:outline-none focus-visible:border-point-green focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-point-green/30"
    >
      <img
        src={imageSrc}
        alt=""
        className="h-[106px] w-[91px] shrink-0 rounded-[10px] object-cover"
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-5 text-text">
          {team.name}
        </h2>
        {team.description ? (
          <p className="mt-3 truncate text-[15px] leading-4 text-text-gray-400">
            {team.description}
          </p>
        ) : null}
        <p className="mt-1 truncate text-sm leading-4 text-text-gray-400">
          {regionName ? `${regionName} · ` : ""}
          {team.currentMemberCount}/{team.maxMember}명
          {deadlineDate ? ` · ${deadlineDate}` : ""}
          {urgentDeadline ? (
            <span
              className={cn(
                urgentDeadline === "D-day" ||
                  urgentDeadline === "D-1" ||
                  urgentDeadline === "D-2" ||
                  urgentDeadline === "D-3"
                  ? "font-semibold text-point-red"
                  : "text-point-red",
              )}
            >
              {" "}
              · {urgentDeadline}
            </span>
          ) : null}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {team.categories.map((category) => (
            <CategoryBadge
              key={category}
              category={category}
              className="text-sm"
            />
          ))}
          {viewerRole ? (
            <span className="rounded-full border border-button bg-button/10 px-2 py-0.5 text-xs font-semibold text-button">
              {viewerRole === "HOST" ? "팀장" : "팀원"}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
