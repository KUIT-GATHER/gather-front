import { useEffect, useRef } from "react";
import { Dialog } from "radix-ui";

import {
  isValidRecognizedMinutes,
  MAX_RECOGNIZED_MINUTES,
  RECOGNIZED_MINUTES_UNIT,
} from "@/features/volunteer/lib/recognizedMinutes";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";

const MAX_RECOGNIZED_HOURS = MAX_RECOGNIZED_MINUTES / 60;
const minuteOptions = Array.from(
  { length: 60 / RECOGNIZED_MINUTES_UNIT },
  (_, index) => index * RECOGNIZED_MINUTES_UNIT,
);
const hourOptions = Array.from(
  { length: MAX_RECOGNIZED_HOURS + 1 },
  (_, index) => index,
);
const ITEM_HEIGHT = 48;
const WHEEL_TOP_PADDING = 48;
const WHEEL_BOTTOM_PADDING = 144;

type VolunteerPostingCompleteModalProps = {
  open: boolean;
  recognizedMinutes: number;
  isPending: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onRecognizedMinutesChange: (recognizedMinutes: number) => void;
  onConfirm: () => void;
};

type WheelColumnProps = {
  label: string;
  options: readonly number[];
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

function WheelColumn({
  label,
  options,
  value,
  onChange,
  format = String,
}: WheelColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    ref.current?.scrollTo({ top: selectedIndex * ITEM_HEIGHT });
  }, [selectedIndex]);

  return (
    <div className="relative min-w-0">
      <span className="sr-only">{label}</span>
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        className="h-60 snap-y snap-mandatory scroll-pt-12 scroll-pb-36 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const index = Math.max(
            0,
            Math.min(
              options.length - 1,
              Math.round(event.currentTarget.scrollTop / ITEM_HEIGHT),
            ),
          );
          const next = options[index];

          if (next !== undefined && next !== value) {
            onChange(next);
          }
        }}
      >
        <div style={{ height: WHEEL_TOP_PADDING }} aria-hidden="true" />
        {options.map((option) => {
          const selected = option === value;

          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "flex h-12 w-full snap-start items-center justify-center rounded-xl text-[16px] leading-5.5 transition",
                selected
                  ? "bg-text-gray-100 text-[20px] leading-7 font-medium text-text"
                  : "text-[20px] leading-7 font-normal text-[#A0A0A0]",
              )}
              onClick={() => onChange(option)}
            >
              {format(option)}
            </button>
          );
        })}
        <div style={{ height: WHEEL_BOTTOM_PADDING }} aria-hidden="true" />
      </div>
    </div>
  );
}

export function VolunteerPostingCompleteModal({
  open,
  recognizedMinutes,
  isPending,
  errorMessage,
  onOpenChange,
  onRecognizedMinutesChange,
  onConfirm,
}: VolunteerPostingCompleteModalProps) {
  const hours = Math.floor(recognizedMinutes / 60);
  const minutes = recognizedMinutes % 60;
  const isValid = isValidRecognizedMinutes(recognizedMinutes);
  const availableMinuteOptions =
    hours === MAX_RECOGNIZED_HOURS ? [0] : minuteOptions;

  const updateHours = (nextHours: number) => {
    const nextMinutes = nextHours === MAX_RECOGNIZED_HOURS ? 0 : minutes;

    onRecognizedMinutesChange(nextHours * 60 + nextMinutes);
  };

  const updateMinutes = (nextMinutes: number) => {
    onRecognizedMinutesChange(hours * 60 + nextMinutes);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/30" />
        <Dialog.Content
          onEscapeKeyDown={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
          aria-busy={isPending}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.75rem)] max-w-78 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-point-green bg-white px-6 pt-10.5 pb-6 outline-none"
        >
          <div className="text-center">
            <Dialog.Title className="text-[20px] leading-7 font-semibold text-text">
              봉사 시간을 입력해주세요
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-[16px] leading-5.5 text-[#A0A0A0]">
              1365에서 인정받은
              <br />
              실제 봉사 시간을 선택해주세요
            </Dialog.Description>
          </div>

          <div className="mt-5 px-1">
            <div className="grid grid-cols-2 gap-2 text-center text-[16px] leading-5.5 text-[#A0A0A0]">
              <span>시간</span>
              <span>분</span>
            </div>

            <div
              className={cn(
                "relative mt-1 grid grid-cols-2 gap-2",
                isPending && "pointer-events-none opacity-60",
              )}
            >
              <WheelColumn
                label="시간"
                options={hourOptions}
                value={hours}
                onChange={updateHours}
              />
              <WheelColumn
                label="분"
                options={availableMinuteOptions}
                value={hours === MAX_RECOGNIZED_HOURS ? 0 : minutes}
                format={(value) => String(value).padStart(2, "0")}
                onChange={updateMinutes}
              />
            </div>
          </div>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-3 text-center text-body-14 text-point-red"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              fullWidth
              variant="neutral"
              className="h-12"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              fullWidth
              className="h-12"
              disabled={!isValid || isPending}
              onClick={onConfirm}
            >
              {isPending ? "저장 중" : "확인"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
