import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  //선택 사항
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  confirmVariant?: "primary" | "dark";
};

export default function Modal({
  open,
  title,
  cancelText = "취소",
  confirmText = "확인",
  onCancel,
  onConfirm,
  children,
  confirmVariant = "primary",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/26 px-[35px]">
      <div
        role="dialog"
        aria-modal="true"
        className="box-border w-full max-w-[332px] rounded-[24px] bg-white px-[12px] py-[20px]"
      >
        <div className="flex flex-col items-center gap-[20px]">
          <div className="text-center">
            <p className="text-[18px] font-medium leading-[28px] text-text-black">
              {title}
            </p>

            {children && (
              <div className="text-[18px] font-normal leading-[28px] text-text-black">
                {children}
              </div>
            )}
          </div>

          <div className="flex w-full gap-[8px]">
            <button
              type="button"
              onClick={onCancel}
              className="h-[48px] flex-1 rounded-[40px] bg-[#DCECDF] text-[18px] font-medium leading-[28px] text-text-black"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "h-[48px] flex-1 rounded-[40px] text-[18px] font-normal leading-[28px] text-white",
                confirmVariant === "primary" && "bg-button",
                confirmVariant === "dark" && "bg-icon"
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