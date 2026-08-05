import { describe, expect, it } from "vitest";

import type { MyMeetingActivity } from "@/features/my/types/myActivity.types";

import { getMeetingActivityLabel } from "@/features/my/lib/myActivity";

const meeting = {
  activityType: "MEETING",
  participationId: null,
  postingId: null,
  meetingId: 1,
  volunteerPostingId: 10,
  title: "플로깅 모임",
  actStartDate: "2026-08-20",
  actEndDate: null,
  actStartTime: null,
  actEndTime: null,
  actPlace: null,
  regionName: "영등포구",
  status: null,
  meetingStatus: "RECRUITING",
  postingParticipationStatus: null,
} satisfies MyMeetingActivity;

describe("getMeetingActivityLabel", () => {
  it("uses posting participation status before meeting status", () => {
    expect(
      getMeetingActivityLabel({
        ...meeting,
        postingParticipationStatus: "APPLIED",
      }),
    ).toBe("신청중");
    expect(
      getMeetingActivityLabel({
        ...meeting,
        postingParticipationStatus: "COMPLETED",
      }),
    ).toBe("봉사 완료");
  });
});
