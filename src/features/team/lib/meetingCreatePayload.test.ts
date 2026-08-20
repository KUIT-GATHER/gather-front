import { describe, expect, it } from "vitest";

import { buildMeetingCreateDateTimePayload } from "./meetingCreatePayload";

const postingSchedule = {
  volunteerPostingId: 446,
  activityStartDate: "2026-08-21",
  activityStartTime: "19",
  activityEndDate: "2026-11-06",
  activityEndTime: "21",
};

describe("buildMeetingCreateDateTimePayload", () => {
  it("활동 시작 전 모집 마감일을 허용한다", () => {
    expect(
      buildMeetingCreateDateTimePayload({
        ...postingSchedule,
        deadline: new Date(2026, 7, 20, 23, 59),
      }),
    ).toEqual({
      deadline: new Date(2026, 7, 20, 23, 59).toISOString().slice(0, 19),
      activityStartAt: new Date(2026, 7, 21, 19, 0).toISOString().slice(0, 19),
      activityEndAt: new Date(2026, 10, 6, 21, 0).toISOString().slice(0, 19),
    });
  });

  it("활동 시작 후 모집 마감일을 거절한다", () => {
    expect(
      buildMeetingCreateDateTimePayload({
        ...postingSchedule,
        deadline: new Date(2026, 9, 22, 23, 59),
      }),
    ).toBeUndefined();
  });
});
