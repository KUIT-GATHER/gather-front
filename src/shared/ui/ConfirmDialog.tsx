import { useEffect, useId, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  confirmVariant?: "primary" | "dark";
};

export default function ConfirmDialog({
  open,
  title,
  cancelText = "취소",
  confirmText = "확인",
  onCancel,
  onConfirm,
  children,
  confirmVariant = "primary",
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/26 px-8.75">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? descriptionId : undefined}
        className="box-border w-full max-w-83 rounded-3xl bg-white px-3 py-5"
      >
        <div className="flex flex-col items-center gap-5">
          <div className="text-center">
            <p
              id={titleId}
              className="text-lg font-medium leading-7 text-text"
            >
              {title}
            </p>

            {children ? (
              <div
                id={descriptionId}
                className="text-lg font-normal leading-7 text-text"
              >
                {children}
              </div>
            ) : null}
          </div>

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 flex-1 rounded-full bg-[#DCECDF] text-lg font-medium leading-7 text-text"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "h-12 flex-1 rounded-full text-lg font-normal leading-7 text-white",
                confirmVariant === "primary" && "bg-button",
                confirmVariant === "dark" && "bg-icon",
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
