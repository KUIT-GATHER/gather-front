import { describe, expect, it } from "vitest";

import {
  changeVolunteerScheduleSelectionMode,
  getVolunteerPostingSelectablePeriod,
  selectVolunteerScheduleDate,
} from "./volunteerPostingSchedule";

describe("volunteer posting schedule rules", () => {
  it("이미 시작한 공고는 오늘부터 선택할 수 있다", () => {
    const period = getVolunteerPostingSelectablePeriod(
      { actStartDate: "2026-08-10", actEndDate: "2026-08-20" },
      new Date("2026-08-16T12:00:00"),
    );

    expect(period?.startDate).toEqual(new Date("2026-08-16T00:00:00"));
  });

  it("공고가 이미 종료되었으면 선택 기간이 없다", () => {
    expect(
      getVolunteerPostingSelectablePeriod(
        { actStartDate: "2026-08-01", actEndDate: "2026-08-15" },
        new Date("2026-08-16T12:00:00"),
      ),
    ).toBeUndefined();
  });

  it("single 모드는 시작일과 종료일을 같게 만든다", () => {
    const date = new Date("2026-08-18T00:00:00");

    expect(
      changeVolunteerScheduleSelectionMode("single", { startDate: date }),
    ).toEqual({
      startDate: date,
      endDate: date,
    });
    expect(selectVolunteerScheduleDate("single", {}, date)).toEqual({
      startDate: date,
      endDate: date,
    });
  });

  it("range 모드는 첫 날짜 이후 두 번째 날짜를 종료일로 선택한다", () => {
    const startDate = new Date("2026-08-18T00:00:00");
    const endDate = new Date("2026-08-20T00:00:00");

    expect(
      selectVolunteerScheduleDate("range", { startDate }, endDate),
    ).toEqual({
      startDate,
      endDate,
    });
    expect(
      selectVolunteerScheduleDate(
        "range",
        { startDate },
        new Date("2026-08-17T00:00:00"),
      ),
    ).toEqual({
      startDate: new Date("2026-08-17T00:00:00"),
    });
  });
});
