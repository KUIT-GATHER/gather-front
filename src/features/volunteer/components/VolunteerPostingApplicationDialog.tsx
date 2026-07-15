import { Dialog } from "radix-ui";

import {
  ApplicationConfirmStep,
  ApplicationSelectStep,
} from "@/features/volunteer/components/VolunteerPostingApplicationSteps";
import type { VolunteerPostingApplicationDialogProps } from "@/features/volunteer/types/volunteerApplication.types";
import { cn } from "@/shared/lib/cn";

export function VolunteerPostingApplicationDialog({
  open,
  posting,
  links,
  selectedLink,
  onOpenChange,
  onSelectLink,
  onCancel,
  onApply,
}: VolunteerPostingApplicationDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-text/45" />
        <Dialog.Content
          className={cn(
            "fixed bottom-0 left-1/2 z-50 w-full max-w-app -translate-x-1/2 rounded-t-[2rem] bg-white",
            "px-5.5 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)]",
            "focus:outline-none",
          )}
        >
          {selectedLink ? (
            <ApplicationConfirmStep
              posting={posting}
              onApply={onApply}
              onCancel={onCancel}
            />
          ) : (
            <ApplicationSelectStep links={links} onSelectLink={onSelectLink} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
