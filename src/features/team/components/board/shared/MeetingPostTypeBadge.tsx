import {
  MEETING_POST_TYPE_BADGE_CLASS_NAMES,
  MEETING_POST_TYPE_LABELS,
} from "@/features/team/constants/meetingPost.constants";
import type { MeetingPostType } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type MeetingPostTypeBadgeProps = {
  type: MeetingPostType;
  className?: string;
};

export function MeetingPostTypeBadge({
  type,
  className,
}: MeetingPostTypeBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-[30px] px-2.5 py-1 leading-4",
        MEETING_POST_TYPE_BADGE_CLASS_NAMES[type],
        className,
      )}
    >
      {MEETING_POST_TYPE_LABELS[type]}
    </span>
  );
}
