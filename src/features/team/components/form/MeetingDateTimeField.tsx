import { useState } from "react";

import calendarIcon from "@/shared/assets/icons/info/calender.svg";
import { MeetingDateTimePickerSheet } from "@/features/team/components/form/MeetingDateTimePickerSheet";
import { formatMeetingDateTimeSummary } from "@/features/team/lib/meetingDateTimeFormat";
import {
  formatLocalDateTimeForInput,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import { cn } from "@/shared/lib/cn";

type MeetingDateTimeFieldProps = {
  id: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  maxDate?: Date;
  validate?: (date: Date) => string | undefined;
};

function getInitialDate(value: string, maxDate?: Date) {
  const parsed = parseLocalDateTimeInput(value);
  if (parsed) return parsed;

  const now = new Date();
  now.setSeconds(0, 0);
  return maxDate && now > maxDate ? new Date(maxDate) : now;
}

export function MeetingDateTimeField({
  id,
  title,
  value,
  onChange,
  placeholder = "날짜와 시간을 선택해 주세요",
  disabled = false,
  invalid = false,
  maxDate,
  validate,
}: MeetingDateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => getInitialDate(value, maxDate));
  const [pickerError, setPickerError] = useState<string>();
  const selectedDate = parseLocalDateTimeInput(value);
  const [dateText, timeText] = selectedDate
    ? formatMeetingDateTimeSummary(selectedDate).split("  |  ")
    : [];

  const openPicker = () => {
    setDraft(getInitialDate(value, maxDate));
    setPickerError(undefined);
    setOpen(true);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-[15px] outline-none",
          "focus:border-button focus-visible:ring-2 focus-visible:ring-button/40",
          "disabled:cursor-not-allowed disabled:bg-stroke/30 disabled:text-text-gray-100",
          invalid ? "border-point-red" : "border-stroke",
        )}
        onClick={openPicker}
      >
        {selectedDate ? (
          <span className="flex items-center gap-2 text-text-gray-300">
            <span>{dateText}</span>
            <span
              aria-hidden="true"
              className="h-[15px] border-l border-stroke"
            />
            <span>{timeText}</span>
          </span>
        ) : (
          <span className="text-text-gray-100">{placeholder}</span>
        )}
        <img src={calendarIcon} alt="" aria-hidden="true" className="size-5" />
      </button>
      <MeetingDateTimePickerSheet
        open={open}
        title={title}
        value={draft}
        maxDate={maxDate}
        error={pickerError}
        onOpenChange={setOpen}
        onChange={(next) => {
          setDraft(next);
          setPickerError(undefined);
        }}
        onReset={() => {
          setDraft(getInitialDate("", maxDate));
          setPickerError(undefined);
        }}
        onApply={() => {
          const error = validate?.(draft);
          if (error) {
            setPickerError(error);
            return;
          }

          const nextValue = formatLocalDateTimeForInput(draft);
          if (!nextValue) {
            setPickerError("날짜와 시간을 다시 선택해 주세요.");
            return;
          }

          onChange(nextValue);
          setOpen(false);
        }}
      />
    </>
  );
}
