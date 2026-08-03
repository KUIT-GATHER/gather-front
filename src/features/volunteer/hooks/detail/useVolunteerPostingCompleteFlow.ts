import { useState } from "react";

import {
  useCompleteVolunteerPostingParticipationMutation,
  useSubmitVolunteerPostingRecognizedMinutesMutation,
} from "@/features/volunteer/hooks/detail/useVolunteerPostingParticipationMutation";
import { isValidRecognizedMinutes } from "@/features/volunteer/lib/recognizedMinutes";
import {
  getVolunteerPostingCompleteErrorMessage,
  getVolunteerPostingRecognizedMinutesErrorMessage,
  RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE,
} from "@/features/volunteer/lib/volunteerPostingParticipationErrors";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type UseVolunteerPostingCompleteFlowParams = {
  posting: VolunteerPosting | undefined;
  postingId: number;
  isAuthenticated: boolean;
  onLoginRequired: (postingId: number) => void;
  onClearParticipationErrors: () => void;
  refetchPosting: () => unknown;
};

export function useVolunteerPostingCompleteFlow({
  posting,
  postingId,
  isAuthenticated,
  onLoginRequired,
  onClearParticipationErrors,
  refetchPosting,
}: UseVolunteerPostingCompleteFlowParams) {
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCompleteSuccessDialogOpen, setIsCompleteSuccessDialogOpen] =
    useState(false);
  const [recognizedMinutes, setRecognizedMinutes] = useState(0);
  const [completedRecognizedMinutes, setCompletedRecognizedMinutes] =
    useState(0);
  const [isCompletionProcessed, setIsCompletionProcessed] = useState(false);
  const [completeErrorMessage, setCompleteErrorMessage] = useState<string>();
  const [recognizedMinutesErrorMessage, setRecognizedMinutesErrorMessage] =
    useState<string>();
  const completeMutation =
    useCompleteVolunteerPostingParticipationMutation(postingId);
  const submitRecognizedMinutesMutation =
    useSubmitVolunteerPostingRecognizedMinutesMutation(postingId);
  const isPending =
    completeMutation.isPending || submitRecognizedMinutesMutation.isPending;

  const resetCompleteState = () => {
    setCompleteErrorMessage(undefined);
    setRecognizedMinutesErrorMessage(undefined);
    setIsCompletionProcessed(false);
    setRecognizedMinutes(0);
  };

  const submitRecognizedMinutes = () => {
    submitRecognizedMinutesMutation.mutate(recognizedMinutes, {
      onSuccess: () => {
        setCompletedRecognizedMinutes(recognizedMinutes);
        setIsCompleteSuccessDialogOpen(true);
        setIsCompleteModalOpen(false);
        resetCompleteState();
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          (error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND ||
            error.code === API_ERROR_CODE.PARTICIPATION_HOURS_NOT_ALLOWED ||
            error.code === API_ERROR_CODE.PARTICIPATION_HOURS_ALREADY_SUBMITTED)
        ) {
          void refetchPosting();
        }

        setRecognizedMinutesErrorMessage(
          getVolunteerPostingRecognizedMinutesErrorMessage(error),
        );
      },
    });
  };

  const handleCompleteClick = () => {
    if (!posting || posting.participationAction !== "COMPLETE") {
      return;
    }

    if (!isAuthenticated) {
      onLoginRequired(posting.id);
      return;
    }

    resetCompleteState();
    onClearParticipationErrors();
    setIsCompleteModalOpen(true);
  };

  const handleCompleteConfirm = () => {
    setCompleteErrorMessage(undefined);
    setRecognizedMinutesErrorMessage(undefined);

    if (!isValidRecognizedMinutes(recognizedMinutes)) {
      setRecognizedMinutesErrorMessage(
        RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE,
      );
      return;
    }

    if (isCompletionProcessed) {
      submitRecognizedMinutes();
      return;
    }

    completeMutation.mutate(undefined, {
      onSuccess: () => {
        setIsCompletionProcessed(true);
        submitRecognizedMinutes();
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_ALREADY_COMPLETED
        ) {
          setIsCompletionProcessed(true);
          submitRecognizedMinutes();
          void refetchPosting();
          return;
        }

        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND
        ) {
          void refetchPosting();
        }

        setCompleteErrorMessage(getVolunteerPostingCompleteErrorMessage(error));
      },
    });
  };

  const handleCompleteModalOpenChange = (open: boolean) => {
    if (!open && isPending) {
      return;
    }

    setIsCompleteModalOpen(open);

    if (!open) {
      resetCompleteState();
    }
  };

  return {
    isPending,
    handleCompleteClick,
    completeModalProps: {
      open: isCompleteModalOpen,
      recognizedMinutes,
      isPending,
      errorMessage: completeErrorMessage ?? recognizedMinutesErrorMessage,
      onOpenChange: handleCompleteModalOpenChange,
      onRecognizedMinutesChange: setRecognizedMinutes,
      onConfirm: handleCompleteConfirm,
    },
    successDialogProps: {
      open: isCompleteSuccessDialogOpen,
      recognizedMinutes: completedRecognizedMinutes,
      onConfirm: () => {
        setIsCompleteSuccessDialogOpen(false);
      },
    },
  };
}
