import { describe, expect, it, vi } from "vitest";

import { ensureMeetingCreated } from "./meetingCreateWorkflow";

describe("ensureMeetingCreated", () => {
  it("이미지 업로드 실패 후 재시도해도 모임 생성 요청은 한 번만 실행한다", async () => {
    const createMeeting = vi.fn().mockResolvedValue({ meetingId: 123 });
    const createdMeetingId = await ensureMeetingCreated({
      createdMeetingId: null,
      createMeeting,
    });

    const retriedMeetingId = await ensureMeetingCreated({
      createdMeetingId,
      createMeeting,
    });

    expect(createdMeetingId).toBe(123);
    expect(retriedMeetingId).toBe(123);
    expect(createMeeting).toHaveBeenCalledTimes(1);
  });
});
