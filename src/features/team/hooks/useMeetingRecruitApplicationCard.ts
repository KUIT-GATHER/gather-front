import { useCallback } from "react";
import { useNavigate } from "react-router";

import { useMeetingRecruitParticipationMutation } from "@/features/team/hooks/useMeetingRecruitParticipationMutation";
import { useMeetingRecruitQuery } from "@/features/team/hooks/useMeetingRecruitQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import {
  formatMeetingDurationMinutes,
  formatMeetingFullDate,
  formatMeetingFullDateWithWeekday,
  formatMeetingTimeRange,
} from "@/features/team/lib/teamFormatters";
import type { MeetingRecruitDetail } from "@/features/team/types/team.types";

function getParticipationButtonLabel(
  recruit: MeetingRecruitDetail,
  isPending: boolean,
) {
  if (isPending) {
    return "처리 중";
  }

  if (recruit.applied) {
    return "신청 완료";
  }

  if (!recruit.applicationOpen) {
    return "신청 마감";
  }

  if (recruit.full) {
    return "모집 완료";
  }

  return "참여 신청";
}

function getActivityDateLabel(recruit: MeetingRecruitDetail) {
  const timeRange = formatMeetingTimeRange(
    recruit.actStartTime,
    recruit.actEndTime,
  );
  const recognizedMinutes = recruit.timeRecognized
    ? formatMeetingDurationMinutes(recruit.recognizedMinutes)
    : null;

  return [
    formatMeetingFullDateWithWeekday(recruit.actDate) ?? recruit.actDate,
    timeRange,
    recognizedMinutes ? `(${recognizedMinutes})` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function getApplicationPeriodLabel(recruit: MeetingRecruitDetail) {
  const applicationStartDate =
    formatMeetingFullDate(recruit.createdAt) ?? recruit.createdAt;
  const applicationEndDate =
    formatMeetingFullDate(recruit.applyDeadline) ?? recruit.applyDeadline;

  return `${applicationStartDate} ~ ${applicationEndDate}`;
}

function getRecruitProgress(recruit: MeetingRecruitDetail) {
  if (recruit.maxParticipants <= 0) {
    return 0;
  }

  return Math.min(100, (recruit.appliedCount / recruit.maxParticipants) * 100);
}

function canToggleRecruitParticipation(recruit: MeetingRecruitDetail) {
  return recruit.applicationOpen && (!recruit.full || recruit.applied);
}

export function useMeetingRecruitApplicationCard(
  meetingId: number,
  postId: number,
) {
  const navigate = useNavigate();
  const { home } = useTeamDetailContext();
  const {
    data: recruit,
    isLoading,
    isError,
    refetch,
  } = useMeetingRecruitQuery(meetingId, postId);
  const {
    mutate,
    isPending: isParticipationPending,
    isError: isParticipationError,
  } = useMeetingRecruitParticipationMutation(meetingId, postId);
  const linkedPostingId = home.linkedPostingId;

  const retryRecruit = useCallback(() => {
    void refetch();
  }, [refetch]);

  const toggleParticipation = useCallback(() => {
    mutate();
  }, [mutate]);

  const navigateToLinkedPosting =
    linkedPostingId === null
      ? undefined
      : () => navigate(`/volunteers/${linkedPostingId}`);

  return {
    recruit,
    isLoading,
    isError,
    retryRecruit,
    activityDateLabel: recruit ? getActivityDateLabel(recruit) : "",
    applicationPeriodLabel: recruit ? getApplicationPeriodLabel(recruit) : "",
    progress: recruit ? getRecruitProgress(recruit) : 0,
    canToggleParticipation: recruit
      ? canToggleRecruitParticipation(recruit)
      : false,
    participationButtonLabel: recruit
      ? getParticipationButtonLabel(recruit, isParticipationPending)
      : "",
    isParticipationPending,
    isParticipationError,
    navigateToLinkedPosting,
    toggleParticipation,
  };
}
