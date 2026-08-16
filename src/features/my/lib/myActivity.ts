import type {
  MyMeetingRecruitActivity,
  MyVolunteerActivityStatus,
} from "@/features/my/types/myActivity.types";

const activityStatusLabels: Record<MyVolunteerActivityStatus, string> = {
  APPLIED: "신청중",
  CONFIRMED: "신청중",
  COMPLETED: "봉사 완료",
  REVIEWED: "봉사 완료",
};

export function getMyActivityStatusLabel(status: MyVolunteerActivityStatus) {
  return activityStatusLabels[status];
}

export function canCancelMeetingRecruitActivity(
  activity: MyMeetingRecruitActivity,
) {
  return activity.participationAction === "CANCEL";
}
