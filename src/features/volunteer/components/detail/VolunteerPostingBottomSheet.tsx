import type { ReactNode } from "react";
import { Dialog } from "radix-ui";

import CloseIcon from "@/assets/icons/X.svg";
import { cn } from "@/shared/lib/cn";
import Button, { type ButtonProps } from "@/shared/ui/Button";
import IconButton from "@/shared/ui/IconButton";

type VolunteerPostingBottomSheetAction = {
  label: string;
  pendingLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  isPending?: boolean;
  variant?: ButtonProps["variant"];
  className?: string;
};

type VolunteerPostingBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  primaryAction?: VolunteerPostingBottomSheetAction;
  secondaryAction?: VolunteerPostingBottomSheetAction;
  className?: string;
};

function renderAction(action: VolunteerPostingBottomSheetAction) {
  return (
    <Button
      fullWidth
      variant={action.variant}
      disabled={action.disabled || action.isPending}
      className={action.className}
      onClick={action.onClick}
    >
      {action.isPending && action.pendingLabel
        ? action.pendingLabel
        : action.label}
    </Button>
  );
}

export function VolunteerPostingBottomSheet({
  open,
  onOpenChange,
  title,
  children,
  primaryAction,
  secondaryAction,
  className,
}: VolunteerPostingBottomSheetProps) {
  const actionCount =
    Number(Boolean(primaryAction)) + Number(Boolean(secondaryAction));

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
          <div className="flex shrink-0 items-start justify-between px-5.5 pt-8">
            <Dialog.Title className="min-w-0 flex-1 text-title-18 text-text">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton
                label="닫기"
                icon={<img src={CloseIcon} alt="" />}
                variant="plain"
                className="-mt-2 -mr-2"
              />
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            {title} 안내
          </Dialog.Description>

          <div
            className={cn("min-h-0 flex-1 overflow-y-auto px-5.5 pt-5 pb-3")}
          >
            {children}
          </div>

          {primaryAction || secondaryAction ? (
            <div
              className={cn(
                "grid shrink-0 gap-5 px-5.5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]",
                actionCount === 2 ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {secondaryAction ? renderAction(secondaryAction) : null}
              {primaryAction ? renderAction(primaryAction) : null}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
