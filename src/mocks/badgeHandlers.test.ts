import { describe, expect, it } from "vitest";

import {
  addMockBadgeProgress,
  getMockBadges,
  resetMockBadges,
} from "./badgeHandlers";

describe("badge mock state", () => {
  it("keeps an earned badge earned after progress decreases", () => {
    resetMockBadges();
    addMockBadgeProgress(2, "COMMENT_10", 10);
    addMockBadgeProgress(2, "COMMENT_10", -1);

    expect(
      getMockBadges(2).find((badge) => badge.badgeType === "COMMENT_10"),
    ).toMatchObject({
      earned: true,
      currentValue: 10,
      targetValue: 10,
    });
  });
});
