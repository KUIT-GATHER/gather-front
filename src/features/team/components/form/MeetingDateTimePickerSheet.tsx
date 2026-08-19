import calendarIcon from "@/features/team/assets/date-time-picker/calendar.svg";
import refreshIcon from "@/features/team/assets/date-time-picker/refresh.svg";
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
      className="max-h-[min(90dvh,55rem)] rounded-t-[40px] bg-bg"
      contentClassName="px-5.5 pt-3.5 pb-0"
      footerClassName="pt-[7px] pb-[37px]"
      leadingAction={
        <button
          type="button"
          className="inline-flex h-11 items-center text-xs font-medium text-point-red"
          onClick={onReset}
        >
          재설정
          <img
            src={refreshIcon}
            alt=""
            aria-hidden="true"
            className="h-11 w-[19px]"
          />
        </button>
      }
      footer={
        <div className="flex justify-center">
          <Button
            type="button"
            fullWidth
            className="h-12 max-w-[315px] active:bg-icon"
            onClick={onApply}
          >
            적용하기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex h-[68px] w-[calc(100%+3px)] self-center items-center justify-between rounded-2xl border border-button bg-white px-4">
          <p className="text-base font-medium text-text-gray-300">
            {formatMeetingDateTimeSummary(value)}
          </p>
          <span className="flex size-6 items-center justify-center">
            <img
              src={calendarIcon}
              alt=""
              aria-hidden="true"
              className="h-[20.814px] w-[18px]"
            />
          </span>
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
