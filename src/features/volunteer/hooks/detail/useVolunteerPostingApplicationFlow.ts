import { useState } from "react";

import {
  useApplyVolunteerPostingParticipationMutation,
  useCancelVolunteerPostingParticipationMutation,
} from "@/features/volunteer/hooks/detail/useVolunteerPostingParticipationMutation";
import {
  getVolunteerPostingApplyErrorMessage,
  getVolunteerPostingCancelErrorMessage,
} from "@/features/volunteer/lib/volunteerPostingParticipationErrors";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type UseVolunteerPostingApplicationFlowParams = {
  posting: VolunteerPosting | undefined;
  postingId: number;
  isAuthenticated: boolean;
  onLoginRequired: (postingId: number) => void;
  refetchPosting: () => unknown;
};

export function useVolunteerPostingApplicationFlow({
  posting,
  postingId,
  isAuthenticated,
  onLoginRequired,
  refetchPosting,
}: UseVolunteerPostingApplicationFlowParams) {
  const [isApplySheetOpen, setIsApplySheetOpen] = useState(false);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string>();
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string>();
  const applyMutation =
    useApplyVolunteerPostingParticipationMutation(postingId);
  const cancelMutation =
    useCancelVolunteerPostingParticipationMutation(postingId);

  const clearErrors = () => {
    setApplyErrorMessage(undefined);
    setCancelErrorMessage(undefined);
  };

  const handleApplyClick = () => {
    if (!posting) {
      return;
    }

    if (
      posting.participationAction !== "APPLY" ||
      posting.status !== "RECRUITING"
    ) {
      return;
    }

    if (!isAuthenticated) {
      onLoginRequired(posting.id);
      return;
    }

    clearErrors();
    setIsApplySheetOpen(true);
  };

  const handleApplyConfirm = () => {
    setApplyErrorMessage(undefined);

    applyMutation.mutate(undefined, {
      onSuccess: (participation) => {
        setIsApplySheetOpen(false);
        window.location.assign(participation.applicationUrl);
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_DUPLICATE
        ) {
          void refetchPosting();
        }

        setApplyErrorMessage(getVolunteerPostingApplyErrorMessage(error));
      },
    });
  };

  const handleCancelClick = () => {
    if (!posting || posting.participationAction !== "CANCEL") {
      return;
    }

    if (!isAuthenticated) {
      onLoginRequired(posting.id);
      return;
    }

    clearErrors();

    cancelMutation.mutate(undefined, {
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND
        ) {
          void refetchPosting();
        }

        setCancelErrorMessage(getVolunteerPostingCancelErrorMessage(error));
      },
    });
  };

  const handleApplySheetOpenChange = (open: boolean) => {
    setIsApplySheetOpen(open);

    if (!open) {
      setApplyErrorMessage(undefined);
    }
  };

  return {
    clearErrors,
    cancelErrorMessage,
    isApplyPending: applyMutation.isPending,
    isCancelPending: cancelMutation.isPending,
    handleApplyClick,
    handleCancelClick,
    applyConfirmSheetProps: {
      open: isApplySheetOpen,
      isPending: applyMutation.isPending,
      errorMessage: applyErrorMessage,
      onOpenChange: handleApplySheetOpenChange,
      onConfirm: handleApplyConfirm,
    },
  };
}
