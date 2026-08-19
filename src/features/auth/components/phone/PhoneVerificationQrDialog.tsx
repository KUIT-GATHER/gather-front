import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import type { PhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import Spinner from "@/shared/ui/Spinner";

type PhoneVerificationQrDialogProps = {
  flow: PhoneVerificationFlow;
};

export function PhoneVerificationQrDialog({
  flow,
}: PhoneVerificationQrDialogProps) {
  return (
    <Dialog.Root
      open={flow.isQrDialogOpen}
      onOpenChange={flow.setIsQrDialogOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/30" />
        <Dialog.Content
          aria-busy={flow.isQrPending}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 box-border flex aspect-square w-[calc(100%-2rem)] max-w-[26rem]",
            "-translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white p-0",
            "shadow-2xl outline-none",
          )}
        >
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="닫기"
              className="absolute -top-11 right-0 z-10 flex size-9 items-center justify-center rounded-full border border-stroke bg-white/90 text-text-gray-400 shadow-sm transition hover:bg-stroke/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="sr-only">휴대폰 인증 QR</Dialog.Title>
          <Dialog.Description className="sr-only">
            휴대폰 카메라로 QR을 스캔한 뒤 문자앱에서 메시지를 전송해 주세요.
          </Dialog.Description>

          <div className="flex size-full items-center justify-center bg-white">
            {flow.qrCode ? (
              <img
                src={flow.qrCode}
                alt="휴대폰 인증 QR 코드"
                className="size-full object-contain"
              />
            ) : flow.isQrPending ? (
              <Spinner label="QR 코드 로딩 중" />
            ) : flow.qrError ? (
              <div
                role="alert"
                className="flex max-w-80 flex-col items-center gap-5 px-6 text-center"
              >
                <p className="text-sm leading-6 text-text-gray-400">
                  QR 코드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                </p>
                <Button type="button" size="medium" onClick={flow.retryQr}>
                  QR 다시 불러오기
                </Button>
              </div>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
