import { CalendarDays, RefreshCw } from "lucide-react";

import { SingleDateCalendar } from "@/features/team/components/SingleDateCalendar";
import { TimeWheelPicker } from "@/features/team/components/TimeWheelPicker";
import { formatMeetingDateTimeSummary } from "@/features/team/lib/meetingDateTimeFormat";
import Button from "@/shared/ui/Button";
import BottomSheet from "@/shared/ui/BottomSheet";

type MeetingDateTimePickerSheetProps = {
  open: boolean;
  title: string;
  value: Date;
  maxDate?: Date;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: Date) => void;
  onReset: () => void;
  onApply: () => void;
};

export function MeetingDateTimePickerSheet({
  open,
  title,
  value,
  maxDate,
  error,
  onOpenChange,
  onChange,
  onReset,
  onApply,
}: MeetingDateTimePickerSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className="max-h-[min(96dvh,55rem)] rounded-t-[40px] bg-bg"
      contentClassName="px-5.5 pt-3 pb-1"
      leadingAction={
        <button
          type="button"
          className="inline-flex h-11 items-center gap-1 text-xs font-medium text-point-red"
          onClick={onReset}
        >
          재설정
          <RefreshCw aria-hidden="true" className="size-4" />
        </button>
      }
      footer={
        <div className="flex justify-center">
          <Button
            type="button"
            fullWidth
            className="max-w-[315px] active:bg-icon"
            onClick={onApply}
          >
            적용하기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex h-[68px] items-center justify-between rounded-2xl border border-button bg-white px-4">
          <p className="text-base font-medium text-text-gray-400">
            {formatMeetingDateTimeSummary(value)}
          </p>
          <CalendarDays aria-hidden="true" className="size-6 text-icon" />
        </div>
        <div className="min-h-[348px] rounded-2xl border border-button bg-white px-1 pb-2">
          <SingleDateCalendar
            selected={value}
            maxDate={maxDate}
            onSelect={(date) => {
              const next = new Date(date);
              next.setHours(value.getHours(), value.getMinutes(), 0, 0);
              onChange(next);
            }}
          />
        </div>
        <TimeWheelPicker value={value} onChange={onChange} />
        {error ? (
          <p role="alert" className="text-sm text-point-red">
            {error}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
