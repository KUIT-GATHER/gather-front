import { useMemo, useState } from "react";
import type { DateRange } from "@daypicker/react";
import { Check } from "lucide-react";

import {
  changeVolunteerScheduleSelectionMode,
  getVolunteerPostingSelectablePeriod,
  isDateWithinVolunteerPostingPeriod,
  selectVolunteerScheduleDate,
  toVolunteerPostingParticipationDate,
  type ScheduleSelectionMode,
} from "@/features/volunteer/lib/volunteerPostingSchedule";
import type {
  VolunteerPosting,
  VolunteerPostingParticipationApplyRequest,
} from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import DateRangeCalendar from "@/shared/ui/DateRangeCalendar";

type VolunteerPostingScheduleSheetProps = {
  open: boolean;
  posting: VolunteerPosting;
  isPending: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (request: VolunteerPostingParticipationApplyRequest) => void;
};

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function VolunteerPostingScheduleSheet({
  open,
  posting,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: VolunteerPostingScheduleSheetProps) {
  const selectablePeriod = useMemo(
    () => getVolunteerPostingSelectablePeriod(posting),
    [posting],
  );
  const [selectionMode, setSelectionMode] =
    useState<ScheduleSelectionMode>("single");
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();

  const selectedRange: DateRange | undefined = selectedStartDate
    ? { from: selectedStartDate, to: selectedEndDate }
    : undefined;
  const canConfirm = Boolean(
    selectablePeriod && selectedStartDate && selectedEndDate,
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      return;
    }

    const date =
      selectionMode === "single" ||
      !selectedStartDate ||
      selectedEndDate ||
      range.from < selectedStartDate
        ? range.from
        : (range.to ?? range.from);

    if (
      !selectablePeriod ||
      !isDateWithinVolunteerPostingPeriod(date, selectablePeriod)
    ) {
      return;
    }

    const nextSelection = selectVolunteerScheduleDate(
      selectionMode,
      { startDate: selectedStartDate, endDate: selectedEndDate },
      date,
    );

    setSelectedStartDate(nextSelection.startDate);
    setSelectedEndDate(nextSelection.endDate);
  };

  const handleSelectionModeChange = (isRange: boolean) => {
    const nextMode = isRange ? "range" : "single";
    const nextSelection = changeVolunteerScheduleSelectionMode(nextMode, {
      startDate: selectedStartDate,
      endDate: selectedEndDate,
    });

    setSelectionMode(nextMode);
    setSelectedStartDate(nextSelection.startDate);
    setSelectedEndDate(nextSelection.endDate);
  };

  const handleConfirm = () => {
    if (!selectedStartDate || !selectedEndDate || !canConfirm) {
      return;
    }

    onConfirm({
      participationStartDate:
        toVolunteerPostingParticipationDate(selectedStartDate),
      participationEndDate:
        toVolunteerPostingParticipationDate(selectedEndDate),
    });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="봉사 일정 선택"
      className="h-[min(700px,96dvh)] max-h-[min(700px,96dvh)] rounded-t-[40px] bg-bg"
      contentClassName="px-5.5 pt-5 pb-0"
      footerClassName="pt-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
      footer={
        <div className="mx-auto w-full max-w-[315px]">
          <Button
            type="button"
            fullWidth
            className="h-12"
            disabled={!canConfirm || isPending}
            onClick={handleConfirm}
          >
            {isPending ? "등록 중" : "확인"}
          </Button>
        </div>
      }
    >
      {selectablePeriod ? (
        <>
          <div className="rounded-3xl border-2 border-button px-3 py-4">
            <DateRangeCalendar
              selected={selectedRange}
              defaultMonth={selectablePeriod.startDate}
              startMonth={getMonthStart(selectablePeriod.startDate)}
              endMonth={getMonthStart(selectablePeriod.endDate)}
              disabled={[
                { before: selectablePeriod.startDate },
                { after: selectablePeriod.endDate },
              ]}
              onSelect={handleDateSelect}
            />
          </div>

          <label className="mt-6 flex h-[76px] cursor-pointer items-center justify-between rounded-xl border border-stroke bg-white px-4 text-title-18 text-text">
            <span>기간으로 선택하기</span>
            <span
              className={cn(
                "grid size-7 place-items-center rounded border-2 border-button",
                selectionMode === "range" && "bg-button text-white",
              )}
            >
              {selectionMode === "range" ? (
                <Check aria-hidden="true" className="size-5 stroke-[3]" />
              ) : null}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={selectionMode === "range"}
              onChange={(event) =>
                handleSelectionModeChange(event.target.checked)
              }
            />
          </label>
        </>
      ) : (
        <p
          role="alert"
          className="py-12 text-center text-body-14 text-point-red"
        >
          선택할 수 있는 봉사 일정이 없어요.
        </p>
      )}

      {errorMessage ? (
        <p role="alert" className="mt-3 text-body-14 text-point-red">
          {errorMessage}
        </p>
      ) : null}
    </BottomSheet>
  );
}
