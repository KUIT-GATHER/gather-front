import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import { teamQueries } from "@/features/team/api/team.queries";
import { useToggleMeetingRecruitParticipationMutation } from "@/features/team/hooks/useMeetingRecruitMutations";
import {
  formatMeetingRecruitActivitySchedule,
  formatMeetingRecruitApplicationDeadline,
  formatMeetingRecruitLocation,
} from "@/features/team/lib/meetingRecruitFormatters";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

function SummaryIcon({ src }: { src: string }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function MeetingRecruitSummaryCard({
  meetingId,
  postId,
}: {
  meetingId: number;
  postId: number;
}) {
  const navigate = useNavigate();
  const query = useQuery(teamQueries.recruit(meetingId, postId));
  const participationMutation = useToggleMeetingRecruitParticipationMutation(
    meetingId,
    postId,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  if (query.isLoading)
    return (
      <LoadingState className="min-h-32" label="활동 정보를 불러오는 중" />
    );
  if (query.isError || !query.data)
    return (
      <ErrorState className="min-h-32" title="활동 정보를 불러오지 못했어요" />
    );
  const recruit = query.data;
  const progress = recruit.maxParticipants
    ? Math.min(100, (recruit.appliedCount / recruit.maxParticipants) * 100)
    : 0;
  const isCancelAction = recruit.participationAction === "CANCEL";
  const actionLabel =
    recruit.participationAction === "APPLY"
      ? "참여 신청"
      : isCancelAction
        ? "신청 완료"
        : recruit.participationStatus === "CONFIRMED"
          ? "참가 확정"
          : recruit.participationStatus === "COMPLETED" ||
              recruit.participationStatus === "REVIEWED"
            ? "활동 완료"
            : recruit.participationStatus === "REJECTED"
              ? "신청 반려"
              : "신청할 수 없어요";

  return (
    <section
      className="mt-6 rounded-2xl border border-stroke bg-white p-4"
      aria-label="모집 활동 요약"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-title-18 text-text">
          {recruit.title}
        </h3>
        <button
          type="button"
          className="shrink-0 pt-1 text-body-14 text-text-gray-400 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() =>
            navigate(`/volunteers/meeting-recruits/${meetingId}/${postId}`)
          }
        >
          봉사 공고로 이동
        </button>
      </div>

      <div className="mt-5">
        <h4 className="text-base font-semibold text-text">봉사 일정 및 장소</h4>
        <dl className="mt-3 flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <SummaryIcon src={CalendarIcon} />
            <dt className="sr-only">봉사 일정</dt>
            <dd className="min-w-0 text-body-14 text-text">
              {formatMeetingRecruitActivitySchedule(
                recruit.activityStartAt,
                recruit.activityEndAt,
              )}
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <SummaryIcon src={LocationIcon} />
            <dt className="sr-only">봉사 장소</dt>
            <dd className="min-w-0 text-body-14 text-text">
              {formatMeetingRecruitLocation(recruit.regionName, recruit.place)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5">
        <h4 className="text-base font-semibold text-text">신청 마감일</h4>
        <div className="mt-3 flex items-start gap-3">
          <SummaryIcon src={ClockIcon} />
          <p className="min-w-0 text-body-14 text-text">
            {formatMeetingRecruitApplicationDeadline(recruit.applyDeadlineAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-body-14 text-text">
        <span className="font-semibold">참여 신청 현황</span>
        <span className="font-medium">
          {recruit.appliedCount} / {recruit.maxParticipants}명
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stroke">
        <div
          className="h-full rounded-full bg-button"
          style={{ width: `${progress}%` }}
        />
      </div>
      {actionError ? (
        <p role="alert" className="mt-3 text-body-14 text-point-red">
          {actionError}
        </p>
      ) : null}
      <Button
        className="mt-5 h-12"
        fullWidth
        size="medium"
        disabled={
          recruit.participationAction === "NONE" ||
          participationMutation.isPending
        }
        variant={isCancelAction ? "dark" : "primary"}
        aria-label={isCancelAction ? "신청 완료, 누르면 신청 취소" : undefined}
        onClick={() => setConfirmOpen(true)}
      >
        {participationMutation.isPending ? "처리 중" : actionLabel}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title={
          isCancelAction ? (
            "봉사 신청을 취소하시겠어요?"
          ) : (
            <>
              신청 시 모임장에게 회원님의
              <br />
              전화번호와 생년월일이 전달됩니다.
              <br />
              봉사를 신청하시겠습니까?
            </>
          )
        }
        confirmText={isCancelAction ? "취소하기" : "확인"}
        isPending={participationMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setActionError(null);
          participationMutation.mutate(undefined, {
            onSuccess: () => setConfirmOpen(false),
            onError: () => {
              setConfirmOpen(false);
              setActionError(
                "신청 상태를 변경하지 못했어요. 마감 또는 확정 상태를 확인해 주세요.",
              );
            },
          });
        }}
      />
    </section>
  );
}
