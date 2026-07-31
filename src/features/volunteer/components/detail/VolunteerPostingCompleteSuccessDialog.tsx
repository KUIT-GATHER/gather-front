import { Check } from "lucide-react";
import { AlertDialog } from "radix-ui";

import { formatRecognizedMinutes } from "@/features/volunteer/lib/recognizedMinutes";
import Button from "@/shared/ui/Button";

type VolunteerPostingCompleteSuccessDialogProps = {
  open: boolean;
  recognizedMinutes: number;
  onConfirm: () => void;
};

export function VolunteerPostingCompleteSuccessDialog({
  open,
  recognizedMinutes,
  onConfirm,
}: VolunteerPostingCompleteSuccessDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onConfirm();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-text/26" />

        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-4.375rem)] max-w-51.5 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white px-3 py-5 outline-none">
          <div className="flex flex-col items-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-point-green/15 text-icon">
              <Check className="size-5" strokeWidth={2.5} />
            </div>

            <AlertDialog.Title className="mt-4 text-center text-[18px] leading-7 font-semibold text-text">
              봉사 완료!
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 whitespace-pre-line text-center text-body-14 text-text-gray-400">
              {`${formatRecognizedMinutes(recognizedMinutes)}의 봉사 시간이\n저장되었습니다`}
            </AlertDialog.Description>

            <AlertDialog.Action asChild>
              <Button fullWidth className="mt-5 h-12" onClick={onConfirm}>
                확인
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
