import type { MeetingPostType } from "@/features/team/types/team.types";

export function getWritableMeetingPostTypes(
  isHost: boolean,
  isPostingBased: boolean,
): MeetingPostType[] {
  if (!isHost) return ["REVIEW", "FREE"];

  return isPostingBased
    ? ["NOTICE", "REVIEW", "FREE"]
    : ["NOTICE", "RECRUIT", "REVIEW", "FREE"];
}
