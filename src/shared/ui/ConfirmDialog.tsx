import type { MouseEvent, ReactNode } from "react";
import { AlertDialog } from "radix-ui";

import { cn } from "@/shared/lib/cn";

export type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  description?: ReactNode;
  confirmVariant?: "primary" | "dark" | "danger";
  isPending?: boolean;
  showCancel?: boolean;
};

const confirmVariantClasses: Record<
  NonNullable<ConfirmDialogProps["confirmVariant"]>,
  string
> = {
  primary: "bg-button text-white hover:brightness-95",
  dark: "bg-icon text-white hover:brightness-95",
  danger: "bg-point-red text-white hover:brightness-95",
};

export default function ConfirmDialog({
  open,
  title,
  cancelText = "취소",
  confirmText = "확인",
  onCancel,
  onConfirm,
  children,
  description,
  confirmVariant = "primary",
  isPending = false,
  showCancel = true,
}: ConfirmDialogProps) {
  const dialogDescription = description ?? children;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen || isPending) {
      return;
    }

    onCancel();
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isPending) {
      event.preventDefault();
    }
  };

  const handleConfirmClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    onConfirm();
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-text/26" />

        <AlertDialog.Content
          aria-busy={isPending}
          onEscapeKeyDown={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 box-border w-[calc(100%-2.5rem)] max-w-[22.75rem]",
            "-translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-5",
            "focus:outline-none",
          )}
        >
          <div className="flex flex-col items-center gap-[18px] text-center">
            <AlertDialog.Title className="text-[18px] leading-7 font-semibold text-text">
              {title}
            </AlertDialog.Title>

            {dialogDescription ? (
              <AlertDialog.Description className="text-[16px] leading-[1.3] font-normal text-text-gray-400">
                {dialogDescription}
              </AlertDialog.Description>
            ) : null}

            <div className="flex w-full max-w-[19.25rem] justify-center gap-2">
              {showCancel ? (
                <AlertDialog.Cancel asChild>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleCancelClick}
                    className={cn(
                      "h-12 min-w-0 max-w-[9.375rem] flex-1 rounded-full bg-[#DCECDF] text-[18px] leading-7 font-semibold text-text transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      "disabled:cursor-not-allowed disabled:bg-stroke disabled:text-text-gray-100",
                    )}
                  >
                    {cancelText}
                  </button>
                </AlertDialog.Cancel>
              ) : null}

              <AlertDialog.Action asChild>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmClick}
                  className={cn(
                    "h-12 min-w-0 max-w-[9.375rem] flex-1 rounded-full text-[18px] leading-7 font-semibold transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                    "disabled:cursor-not-allowed disabled:bg-stroke disabled:text-text-gray-100",
                    confirmVariantClasses[confirmVariant],
                  )}
                >
                  {isPending ? (
                    <span role="status" aria-live="polite">
                      처리 중
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </AlertDialog.Action>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
