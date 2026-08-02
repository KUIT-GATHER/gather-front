import { AlertDialog } from "radix-ui";

import GreenCheckIcon from "@/assets/icons/Green-check.svg";
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

        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-4.375rem)] max-w-68 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white px-5 py-5 outline-none">
          <div className="flex flex-col items-center">
            <div className="flex size-14.5 items-center justify-center rounded-full bg-[#F6F0F6] border-[1px] border-[#E9E9E9] border-stroke">
              <img src={GreenCheckIcon} alt="" className="size-7.5" />
            </div>

            <AlertDialog.Title className="mt-5 text-center text-[20px] leading-7 font-semibold text-text">
              봉사 완료!
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 whitespace-pre-line text-center text-[16px] leading-7 font-medium text-text">
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
