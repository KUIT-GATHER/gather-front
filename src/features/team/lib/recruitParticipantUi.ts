import type {
  RecruitAttendanceStatus,
  RecruitConfirmationStatus,
} from "@/features/team/types/meetingRecruit.types";

export type RecruitParticipantUiState = {
  showConfirm: boolean;
  showReject: boolean;
  showAttendance: boolean;
  attendanceDisabled: boolean;
};

export function getRecruitParticipantUiState({
  confirmationStatus,
  activityEndAt,
  now = new Date(),
}: {
  confirmationStatus: RecruitConfirmationStatus;
  activityEndAt: string;
  attendanceStatus?: RecruitAttendanceStatus;
  now?: Date;
}): RecruitParticipantUiState {
  const confirmed = confirmationStatus === "CONFIRMED";
  const activityEnded = new Date(activityEndAt).getTime() <= now.getTime();

  return {
    showConfirm: !confirmed,
    showReject: !confirmed,
    showAttendance: confirmed,
    attendanceDisabled: !activityEnded,
  };
}
