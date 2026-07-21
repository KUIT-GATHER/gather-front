import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { ChevronLeft, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import IconButton from "@/shared/ui/IconButton";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  onBack?: () => void;
  backLabel?: string;
};

export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  onBack,
  backLabel = "이전 화면으로",
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/30" />
        <Dialog.Content
          className={cn(
            "fixed right-0 bottom-0 left-0 z-50 mx-auto flex w-full max-w-app flex-col",
            "max-h-[min(85dvh,46rem)] rounded-t-3xl bg-white shadow-2xl outline-none",
            className,
          )}
        >
          <div className="relative flex shrink-0 items-center justify-between px-5.5 pt-5 pb-3">
            <Dialog.Title className="absolute top-5 left-1/2 -translate-x-1/2 text-title-18 text-text">
              {title}
            </Dialog.Title>
            {onBack ? (
              <IconButton
                label={backLabel}
                icon={<ChevronLeft />}
                variant="plain"
                onClick={onBack}
              />
            ) : (
              <span className="size-11" aria-hidden="true" />
            )}
            <Dialog.Close asChild>
              <IconButton label="닫기" icon={<X />} variant="plain" />
            </Dialog.Close>
          </div>
          <Dialog.Description
            className={
              description ? "px-5.5 text-body-14 text-text-gray-300" : "sr-only"
            }
          >
            {description ?? `${title} 패널`}
          </Dialog.Description>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-5.5 py-3",
              contentClassName,
            )}
          >
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
