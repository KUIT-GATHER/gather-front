import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

export function MeetingRecruitSummaryCard({
  meetingId,
  postId,
}: {
  meetingId: number;
  postId: number;
}) {
  const navigate = useNavigate();
  const query = useQuery(teamQueries.recruit(meetingId, postId));
  if (query.isLoading)
    return (
      <LoadingState className="min-h-32" label="활동 정보를 불러오는 중" />
    );
  if (query.isError || !query.data)
    return (
      <ErrorState className="min-h-32" title="활동 정보를 불러오지 못했어요" />
    );
  const recruit = query.data;
  return (
    <section
      className="mt-6 rounded-2xl border border-stroke bg-white p-4"
      aria-label="모집 활동 요약"
    >
      <h3 className="text-base font-semibold">{recruit.title}</h3>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <CalendarDays className="size-4 text-icon" />
        <span>
          {recruit.activityStartAt.slice(0, 16).replace("T", " ")} ~{" "}
          {recruit.activityEndAt.slice(11, 16)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <MapPin className="size-4 text-icon" />
        <span>
          {recruit.regionName} {recruit.place}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>참여 신청 현황</span>
        <span>
          {recruit.appliedCount} / {recruit.maxParticipants}명
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stroke">
        <div
          className="h-full rounded-full bg-button"
          style={{
            width: `${Math.min(100, recruit.maxParticipants ? (recruit.appliedCount / recruit.maxParticipants) * 100 : 0)}%`,
          }}
        />
      </div>
      <Button
        className="mt-4"
        fullWidth
        size="medium"
        onClick={() =>
          navigate(`/volunteers/meeting-recruits/${meetingId}/${postId}`)
        }
      >
        봉사 공고로 이동
      </Button>
    </section>
  );
}
