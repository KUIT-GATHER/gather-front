import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useApplyVolunteerPostingParticipationMutation,
  useCancelVolunteerPostingParticipationMutation,
  useCompleteVolunteerPostingParticipationMutation,
  useSubmitVolunteerPostingRecognizedMinutesMutation,
} from "@/features/volunteer/hooks/useApplyVolunteerPostingParticipationMutation";
import {
  isValidRecognizedMinutes,
  MAX_RECOGNIZED_MINUTES,
  RECOGNIZED_MINUTES_UNIT,
} from "@/features/volunteer/lib/recognizedMinutes";
import {
  useAddVolunteerPostingBookmarkMutation,
  useRemoveVolunteerPostingBookmarkMutation,
} from "@/features/volunteer/hooks/useVolunteerPostingBookmarkMutation";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { VolunteerPostingApplyBar } from "./VolunteerPostingApplyBar";
import { VolunteerPostingApplyConfirmSheet } from "./VolunteerPostingApplyConfirmSheet";
import { VolunteerPostingCompleteSuccessDialog } from "./VolunteerPostingCompleteSuccessDialog";
import { VolunteerPostingCompleteSheet } from "./VolunteerPostingCompleteSheet";
import { VolunteerPostingConditionCard } from "./VolunteerPostingConditionCard";
import { VolunteerPostingHeader } from "./VolunteerPostingHeader";
import { VolunteerPostingHero } from "./VolunteerPostingHero";
import { VolunteerPostingInfoCard } from "./VolunteerPostingInfoCard";
import { VolunteerPostingTeamSection } from "./VolunteerPostingTeamSection";

type VolunteerPostingDetailProps = {
  postingId: number;
};

const DEFAULT_APPLY_ERROR_MESSAGE =
  "신청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_CANCEL_ERROR_MESSAGE =
  "신청 취소 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_COMPLETE_ERROR_MESSAGE =
  "완료 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE =
  "인정시간 저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE = `인정시간은 ${RECOGNIZED_MINUTES_UNIT}분 단위로 ${MAX_RECOGNIZED_MINUTES / 60}시간 이하까지 입력할 수 있어요.`;

function getApplyErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_APPLY_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.PARTICIPATION_DUPLICATE:
      return "이미 신청한 봉사예요. 하단에서 취소할 수 있어요.";
    case API_ERROR_CODE.POSTING_CLOSED:
      return "마감된 봉사 공고라 신청할 수 없어요.";
    case API_ERROR_CODE.POSTING_APPLICATION_UNAVAILABLE:
      return "1365 신청 정보가 연동되지 않아 신청할 수 없어요.";
    case API_ERROR_CODE.POSTING_NOT_FOUND:
      return "봉사 공고를 찾을 수 없어요.";
    default:
      return DEFAULT_APPLY_ERROR_MESSAGE;
  }
}

function getCancelErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_CANCEL_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "이미 취소되었거나 신청 내역이 없어요.";
    case API_ERROR_CODE.PARTICIPATION_CANCEL_NOT_ALLOWED:
      return "완료한 봉사는 취소할 수 없어요.";
    default:
      return DEFAULT_CANCEL_ERROR_MESSAGE;
  }
}

function getCompleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_COMPLETE_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "신청 내역을 찾을 수 없어요.";
    case API_ERROR_CODE.PARTICIPATION_ALREADY_COMPLETED:
      return "이미 완료 처리된 봉사예요.";
    case API_ERROR_CODE.PARTICIPATION_COMPLETE_NOT_ALLOWED:
      return "활동 종료일이 지나야 완료할 수 있어요.";
    case API_ERROR_CODE.POSTING_NOT_FOUND:
      return "봉사 공고를 찾을 수 없어요.";
    default:
      return DEFAULT_COMPLETE_ERROR_MESSAGE;
  }
}

function getRecognizedMinutesErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.VALIDATION_ERROR:
      return RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE;
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "신청 내역을 찾을 수 없어요.";
    case API_ERROR_CODE.PARTICIPATION_HOURS_NOT_ALLOWED:
      return "완료 처리된 봉사만 인정시간을 입력할 수 있어요.";
    case API_ERROR_CODE.PARTICIPATION_HOURS_ALREADY_SUBMITTED:
      return "이미 인정시간을 입력했어요.";
    default:
      return DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE;
  }
}

export function VolunteerPostingDetail({
  postingId,
}: VolunteerPostingDetailProps) {
  const navigate = useNavigate();
  const [isApplySheetOpen, setIsApplySheetOpen] = useState(false);
  const [isCompleteSheetOpen, setIsCompleteSheetOpen] = useState(false);
  const [isCompleteSuccessDialogOpen, setIsCompleteSuccessDialogOpen] =
    useState(false);
  const [recognizedMinutes, setRecognizedMinutes] = useState(0);
  const [completedRecognizedMinutes, setCompletedRecognizedMinutes] =
    useState(0);
  const [isCompletionProcessed, setIsCompletionProcessed] = useState(false);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string>();
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string>();
  const [completeErrorMessage, setCompleteErrorMessage] = useState<string>();
  const [recognizedMinutesErrorMessage, setRecognizedMinutesErrorMessage] =
    useState<string>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const postingQuery = useVolunteerPostingDetail(postingId);
  const applyMutation =
    useApplyVolunteerPostingParticipationMutation(postingId);
  const cancelMutation =
    useCancelVolunteerPostingParticipationMutation(postingId);
  const completeMutation =
    useCompleteVolunteerPostingParticipationMutation(postingId);
  const submitRecognizedMinutesMutation =
    useSubmitVolunteerPostingRecognizedMinutesMutation(postingId);
  const addBookmarkMutation = useAddVolunteerPostingBookmarkMutation(postingId);
  const removeBookmarkMutation =
    useRemoveVolunteerPostingBookmarkMutation(postingId);
  const isBookmarkPending =
    addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  if (postingQuery.isLoading) {
    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <LoadingState
          label="봉사 공고를 불러오는 중"
          className="min-h-[calc(100dvh-7rem)]"
        />
      </>
    );
  }

  if (postingQuery.isError) {
    const isPostingNotFound =
      postingQuery.error instanceof ApiError &&
      postingQuery.error.code === API_ERROR_CODE.POSTING_NOT_FOUND;

    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <ErrorState
          className="min-h-[calc(100dvh-7rem)] justify-center"
          title={
            isPostingNotFound
              ? "봉사 공고를 찾을 수 없어요"
              : "봉사 공고를 불러오지 못했어요"
          }
          description={
            isPostingNotFound
              ? "삭제되었거나 존재하지 않는 봉사 공고예요."
              : "잠시 후 다시 시도해 주세요."
          }
          primaryAction={
            isPostingNotFound
              ? {
                  label: "봉사공고 목록으로 이동",
                  onClick: () => navigate("/volunteers"),
                }
              : {
                  label: "다시 시도",
                  onClick: () => {
                    void postingQuery.refetch();
                  },
                }
          }
          secondaryAction={
            isPostingNotFound
              ? undefined
              : {
                  label: "이전 페이지",
                  onClick: () => navigate(-1),
                }
          }
        />
      </>
    );
  }

  const posting = postingQuery.data;
  const canCancelParticipation = posting?.participationAction === "CANCEL";
  const canCompleteParticipation = posting?.participationAction === "COMPLETE";
  const isCompleteFlowPending =
    completeMutation.isPending || submitRecognizedMinutesMutation.isPending;

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
      navigate("/login", {
        state: {
          from: `/volunteers/${posting.id}`,
        },
      });
      return;
    }

    setApplyErrorMessage(undefined);
    setCancelErrorMessage(undefined);
    setIsApplySheetOpen(true);
  };

  const handleApplyConfirm = () => {
    setApplyErrorMessage(undefined);

    applyMutation.mutate(undefined, {
      onSuccess: () => {
        setIsApplySheetOpen(false);
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_DUPLICATE
        ) {
          void postingQuery.refetch();
        }

        setApplyErrorMessage(getApplyErrorMessage(error));
      },
    });
  };

  const handleCancelClick = () => {
    if (!posting || !canCancelParticipation) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/volunteers/${posting.id}`,
        },
      });
      return;
    }

    setCancelErrorMessage(undefined);
    setApplyErrorMessage(undefined);

    cancelMutation.mutate(undefined, {
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND
        ) {
          void postingQuery.refetch();
        }

        setCancelErrorMessage(getCancelErrorMessage(error));
      },
    });
  };

  const handleCompleteClick = () => {
    if (!posting || !canCompleteParticipation) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/volunteers/${posting.id}`,
        },
      });
      return;
    }

    setCompleteErrorMessage(undefined);
    setRecognizedMinutesErrorMessage(undefined);
    setApplyErrorMessage(undefined);
    setCancelErrorMessage(undefined);
    setRecognizedMinutes(0);
    setIsCompletionProcessed(false);
    setIsCompleteSheetOpen(true);
  };

  const submitRecognizedMinutes = () => {
    submitRecognizedMinutesMutation.mutate(recognizedMinutes, {
      onSuccess: () => {
        setCompletedRecognizedMinutes(recognizedMinutes);
        setIsCompleteSuccessDialogOpen(true);
        setIsCompleteSheetOpen(false);
        setIsCompletionProcessed(false);
        setRecognizedMinutes(0);
        setCompleteErrorMessage(undefined);
        setRecognizedMinutesErrorMessage(undefined);
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          (error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND ||
            error.code === API_ERROR_CODE.PARTICIPATION_HOURS_NOT_ALLOWED ||
            error.code === API_ERROR_CODE.PARTICIPATION_HOURS_ALREADY_SUBMITTED)
        ) {
          void postingQuery.refetch();
        }

        setRecognizedMinutesErrorMessage(
          getRecognizedMinutesErrorMessage(error),
        );
      },
    });
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
          void postingQuery.refetch();
          return;
        }

        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PARTICIPATION_NOT_FOUND
        ) {
          void postingQuery.refetch();
        }

        setCompleteErrorMessage(getCompleteErrorMessage(error));
      },
    });
  };

  const handleCompleteSheetOpenChange = (open: boolean) => {
    if (!open && isCompleteFlowPending) {
      return;
    }

    setIsCompleteSheetOpen(open);

    if (!open) {
      setCompleteErrorMessage(undefined);
      setRecognizedMinutesErrorMessage(undefined);
      setIsCompletionProcessed(false);
      setRecognizedMinutes(0);
    }
  };

  const handleCreateTeam = () => {
    if (!posting) {
      return;
    }

    navigate(`/volunteers/${posting.id}/teams/new`);
  };

  const handleBookmarkToggle = () => {
    if (!posting) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/volunteers/${posting.id}`,
        },
      });
      return;
    }

    if (posting.bookmarked) {
      removeBookmarkMutation.mutate();
      return;
    }

    addBookmarkMutation.mutate();
  };

  if (!posting) {
    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <EmptyState
          className="mt-10"
          title="봉사 공고가 없어요"
          description="요청한 봉사 공고를 찾을 수 없어요."
          actionLabel="이전 페이지"
          onAction={() => navigate(-1)}
        />
      </>
    );
  }

  return (
    <article className="pb-[calc(env(safe-area-inset-bottom)+7.25rem)]">
      <VolunteerPostingHeader
        title={posting.title}
        onBack={() => navigate(-1)}
        isBookmarked={posting.bookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={handleBookmarkToggle}
        sticky
      />

      <div className="pt-1">
        <VolunteerPostingHero posting={posting} />
        <VolunteerPostingInfoCard posting={posting} className="mt-5" />
        <VolunteerPostingConditionCard posting={posting} className="mt-4" />
        <VolunteerPostingTeamSection
          postingId={posting.id}
          showCreateTeamButton={
            posting.participationStatus !== "CONFIRMED" &&
            posting.participationStatus !== "COMPLETED" &&
            posting.participationStatus !== "REVIEWED"
          }
          className="mt-5"
          onCreateTeam={handleCreateTeam}
        />
      </div>

      <VolunteerPostingApplyBar
        participationAction={posting.participationAction}
        disabled={
          posting.participationAction === "APPLY" &&
          posting.status !== "RECRUITING"
        }
        isApplyPending={applyMutation.isPending}
        isCancelPending={cancelMutation.isPending}
        isCompletePending={isCompleteFlowPending}
        errorMessage={cancelErrorMessage}
        onApply={handleApplyClick}
        onCancel={handleCancelClick}
        onComplete={handleCompleteClick}
      />

      <VolunteerPostingApplyConfirmSheet
        open={isApplySheetOpen}
        posting={posting}
        isPending={applyMutation.isPending}
        errorMessage={applyErrorMessage}
        onOpenChange={(open) => {
          setIsApplySheetOpen(open);
          if (!open) {
            setApplyErrorMessage(undefined);
          }
        }}
        onConfirm={handleApplyConfirm}
      />

      <VolunteerPostingCompleteSheet
        open={isCompleteSheetOpen}
        recognizedMinutes={recognizedMinutes}
        isPending={isCompleteFlowPending}
        errorMessage={completeErrorMessage ?? recognizedMinutesErrorMessage}
        onOpenChange={handleCompleteSheetOpenChange}
        onRecognizedMinutesChange={setRecognizedMinutes}
        onConfirm={handleCompleteConfirm}
      />

      <VolunteerPostingCompleteSuccessDialog
        open={isCompleteSuccessDialogOpen}
        recognizedMinutes={completedRecognizedMinutes}
        onConfirm={() => {
          setIsCompleteSuccessDialogOpen(false);
        }}
      />
    </article>
  );
}
