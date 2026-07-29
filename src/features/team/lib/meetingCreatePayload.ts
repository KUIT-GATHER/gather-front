import type { MeetingCreateRequest } from "@/features/team/types/team.types";
import {
  combineLocalDateAndTime,
  formatLocalDateTimeForApi,
} from "@/shared/lib/localDateTime";

type MeetingCreateDateTimePayload = Pick<
  MeetingCreateRequest,
  "deadline" | "activityStartAt" | "activityEndAt"
>;

type BuildMeetingCreateDateTimePayloadInput = {
  deadline: Date;
  volunteerPostingId: number | null;
  activityStartDate: string | null;
  activityStartTime: string | null;
  activityEndDate: string | null;
  activityEndTime: string | null;
};

export function buildMeetingCreateDateTimePayload({
  deadline,
  volunteerPostingId,
  activityStartDate,
  activityStartTime,
  activityEndDate,
  activityEndTime,
}: BuildMeetingCreateDateTimePayloadInput):
  | MeetingCreateDateTimePayload
  | undefined {
  const formattedDeadline = formatLocalDateTimeForApi(deadline);

  if (!formattedDeadline) {
    return undefined;
  }

  if (volunteerPostingId === null) {
    return {
      deadline: formattedDeadline,
      activityStartAt: null,
      activityEndAt: null,
    };
  }

  const activityStartAt = combineLocalDateAndTime(
    activityStartDate,
    activityStartTime,
  );
  const activityEndAt = combineLocalDateAndTime(
    activityEndDate,
    activityEndTime,
  );

  if (
    !activityStartAt ||
    !activityEndAt ||
    formattedDeadline > activityStartAt ||
    activityStartAt >= activityEndAt
  ) {
    return undefined;
  }

  return {
    deadline: formattedDeadline,
    activityStartAt,
    activityEndAt,
  };
}
