import type { MyMeetingActivity } from "@/features/my/types/myActivity.types";

export function getMeetingActivityLabel(activity: MyMeetingActivity) {
  if (
    activity.postingParticipationStatus === "APPLIED" ||
    activity.postingParticipationStatus === "CONFIRMED"
  ) {
    return "신청중";
  }

  if (
    activity.postingParticipationStatus === "COMPLETED" ||
    activity.postingParticipationStatus === "REVIEWED"
  ) {
    return "봉사 완료";
  }

  return activity.meetingStatus === "COMPLETED" ? "모임 완료" : "활동 예정";
}
