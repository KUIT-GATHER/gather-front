import type {
  MyDisplayablePageActivity,
  MyLinkedMeetingActivity,
  MyPageActivity,
  MyVolunteerActivityStatus,
} from "@/features/my/types/myActivity.types";

const meetingActivityLabels: Record<MyVolunteerActivityStatus, string> = {
  APPLIED: "신청중",
  CONFIRMED: "신청중",
  COMPLETED: "봉사 완료",
  REVIEWED: "봉사 완료",
};

export function isDisplayableMyPageActivity(
  activity: MyPageActivity,
): activity is MyDisplayablePageActivity {
  return (
    activity.activityType === "VOLUNTEER" ||
    (activity.volunteerPostingId !== null &&
      activity.postingParticipationStatus !== null)
  );
}

export function getMeetingActivityLabel(activity: MyLinkedMeetingActivity) {
  return meetingActivityLabels[activity.postingParticipationStatus];
}
