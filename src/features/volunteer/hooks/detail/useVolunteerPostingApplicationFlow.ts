import { useState } from "react";

import {
  useApplyVolunteerPostingParticipationMutation,
  useCancelVolunteerPostingParticipationMutation,
} from "@/features/volunteer/hooks/detail/useVolunteerPostingParticipationMutation";
import {
  getVolunteerPostingApplyErrorMessage,
  getVolunteerPostingCancelErrorMessage,
} from "@/features/volunteer/lib/volunteerPostingParticipationErrors";
import { getVolunteerPostingSelectablePeriod } from "@/features/volunteer/lib/volunteerPostingSchedule";
import type {
  VolunteerPosting,
  VolunteerPostingParticipationApplyRequest,
} from "@/features/volunteer/types/volunteer.types";
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
  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);
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

  const handleOpenExternalApplication = () => {
    setApplyErrorMessage(undefined);

    if (!posting?.applicationUrl) {
      setApplyErrorMessage("외부 신청 페이지를 열 수 없는 공고예요.");
      return;
    }

    window.open(posting.applicationUrl, "_blank", "noopener,noreferrer");
  };

  const handleRegisterSchedule = () => {
    setApplyErrorMessage(undefined);

    if (!posting || !getVolunteerPostingSelectablePeriod(posting)) {
      setApplyErrorMessage(
        "선택할 수 있는 봉사 일정이 없어요. 공고 기간을 확인해 주세요.",
      );
      return;
    }

    setIsApplySheetOpen(false);
    setIsScheduleSheetOpen(true);
  };

  const handleScheduleConfirm = (
    request: VolunteerPostingParticipationApplyRequest,
  ) => {
    setApplyErrorMessage(undefined);

    applyMutation.mutate(request, {
      onSuccess: () => {
        setIsApplySheetOpen(false);
        setIsScheduleSheetOpen(false);
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

  const handleScheduleSheetOpenChange = (open: boolean) => {
    if (applyMutation.isPending) {
      return;
    }

    setIsScheduleSheetOpen(open);

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
      errorMessage: applyErrorMessage,
      onOpenChange: handleApplySheetOpenChange,
      onOpenExternalApplication: handleOpenExternalApplication,
      onRegisterSchedule: handleRegisterSchedule,
    },
    scheduleSheetProps: {
      open: isScheduleSheetOpen,
      isPending: applyMutation.isPending,
      errorMessage: applyErrorMessage,
      onOpenChange: handleScheduleSheetOpenChange,
      onConfirm: handleScheduleConfirm,
    },
  };
}
