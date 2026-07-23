import { useNavigate } from "react-router";

import teamPlusIcon from "@/assets/volunteer/teamplus.svg";
import { useVolunteerPostingMeetingsQuery } from "@/features/volunteer/hooks/useVolunteerPostingMeetingsQuery";
import { cn } from "@/shared/lib/cn";
import Skeleton from "@/shared/ui/Skeleton";

import { VolunteerPostingTeamCard } from "./VolunteerPostingTeamCard";

type VolunteerPostingTeamSectionProps = {
  postingId: number;
  className?: string;
  onCreateTeam: () => void;
};

export function VolunteerPostingTeamSection({
  postingId,
  className,
  onCreateTeam,
}: VolunteerPostingTeamSectionProps) {
  const navigate = useNavigate();
  const meetingsQuery = useVolunteerPostingMeetingsQuery(postingId, {
    page: 0,
    size: 10,
    sort: ["createdAt,desc"],
  });
  const meetings = meetingsQuery.data?.content ?? [];

  return (
    <section className={cn("pt-1", className)}>
      <h2 className="text-[18px] leading-4 font-semibold text-[#000]">
        함께하는 팀
      </h2>

      {meetingsQuery.isLoading ? (
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-22 rounded-xl" />
          <Skeleton className="h-22 rounded-xl" />
        </div>
      ) : null}

      {meetingsQuery.isError ? (
        <div className="mt-4 rounded-xl border border-stroke bg-white px-4 py-5 text-center text-sm text-text-gray-400">
          <p>팀 목록을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => {
              void meetingsQuery.refetch();
            }}
            className="mt-2 font-semibold text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {meetings.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-4">
          {meetings.map((meeting) => (
            <li key={meeting.meetingId}>
              <VolunteerPostingTeamCard
                meeting={meeting}
                onClick={() => navigate(`/teams/${meeting.meetingId}`)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={onCreateTeam}
        className={cn(
          "mt-6 flex h-12.5 w-full items-center justify-center gap-3 rounded-xl",
          "border border-dashed border-point-green bg-[#F8FBF8] text-[16px] leading-[19.5px] font-semibold text-text-green-600",
          "transition hover:bg-point-green/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        )}
      >
        <img src={teamPlusIcon} alt="" className="h-3.5 w-3.5" />
        <span>이 봉사로 팀 만들기</span>
      </button>
    </section>
  );
}
