import type {
  MeetingRecruitDetail,
  RecruitParticipationAction,
} from "@/features/team/types/meetingRecruit.types";

type RecruitParticipationState = Pick<
  MeetingRecruitDetail,
  | "external"
  | "participationAction"
  | "participationStatus"
  | "applicationOpen"
  | "full"
>;

export function getEffectiveRecruitParticipationAction({
  external,
  participationAction,
  participationStatus,
  applicationOpen,
  full,
}: RecruitParticipationState): RecruitParticipationAction {
  if (!external) return participationAction;
  if (!applicationOpen) return "NONE";
  if (participationStatus === "APPLIED") return "CANCEL";
  if (
    (participationStatus === null || participationStatus === "CANCELLED") &&
    !full
  ) {
    return "APPLY";
  }
  return "NONE";
}
