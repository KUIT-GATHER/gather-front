import type { MeetingCreateRequest } from "@/features/team/types/team.types";
import {
  combineLocalDateAndTime,
  formatLocalDateTimeAsUtcForApi,
  parseLocalDateTimeInput,
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
  const formattedDeadline = formatLocalDateTimeAsUtcForApi(deadline);

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

  const activityStartLocal = combineLocalDateAndTime(
    activityStartDate,
    activityStartTime,
  );

  const activityEndLocal = combineLocalDateAndTime(
    activityEndDate,
    activityEndTime,
  );

  if (!activityStartLocal || !activityEndLocal) {
    return undefined;
  }

  const activityStartDateTime = parseLocalDateTimeInput(
    activityStartLocal.slice(0, 16),
  );

  const activityEndDateTime = parseLocalDateTimeInput(
    activityEndLocal.slice(0, 16),
  );

  if (!activityStartDateTime || !activityEndDateTime) {
    return undefined;
  }

  const activityStartAt = formatLocalDateTimeAsUtcForApi(activityStartDateTime);

  const activityEndAt = formatLocalDateTimeAsUtcForApi(activityEndDateTime);

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
