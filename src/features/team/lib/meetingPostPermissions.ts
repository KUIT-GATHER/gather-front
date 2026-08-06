import type { MeetingPostType } from "@/features/team/types/team.types";

export function getWritableMeetingPostTypes(
  isHost: boolean,
): MeetingPostType[] {
  return isHost ? ["NOTICE", "RECRUIT", "REVIEW", "FREE"] : ["REVIEW", "FREE"];
}
