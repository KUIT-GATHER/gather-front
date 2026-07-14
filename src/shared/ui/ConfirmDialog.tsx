import type { MouseEvent, ReactNode } from "react";
import { AlertDialog } from "radix-ui";

import { cn } from "@/shared/lib/cn";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  description?: ReactNode;
  confirmVariant?: "primary" | "dark" | "danger";
  isPending?: boolean;
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
      return;
    }

    onCancel();
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
            "fixed top-1/2 left-1/2 z-50 box-border w-[calc(100%-4.375rem)] max-w-83",
            "-translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white px-3 py-5",
            "focus:outline-none",
          )}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <AlertDialog.Title className="text-lg font-medium leading-7 text-text">
                {title}
              </AlertDialog.Title>

              {dialogDescription ? (
                <AlertDialog.Description className="text-lg font-normal leading-7 text-text">
                  {dialogDescription}
                </AlertDialog.Description>
              ) : null}
            </div>

            <div className="flex w-full gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleCancelClick}
                  className={cn(
                    "h-12 flex-1 rounded-full bg-[#DCECDF] text-lg font-medium leading-7 text-text transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                    "disabled:cursor-not-allowed disabled:bg-stroke disabled:text-text-gray-100",
                  )}
                >
                  {cancelText}
                </button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmClick}
                  className={cn(
                    "h-12 flex-1 rounded-full text-lg font-normal leading-7 transition",
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
