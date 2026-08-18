import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { MeetingPersonDetail } from "@/features/team/components/management/MeetingPersonDetail";
import { RecruitParticipantCard } from "@/features/team/components/management/activity/RecruitParticipantCard";
import {
  useConfirmRecruitParticipantsMutation,
  useRejectRecruitParticipantMutation,
  useUpdateRecruitAttendanceMutation,
} from "@/features/team/hooks/useMeetingRecruitMutations";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { getRecruitParticipantUiState } from "@/features/team/lib/recruitParticipantUi";
import type { RecruitParticipantSummary } from "@/features/team/types/meetingRecruit.types";
import { ApiError } from "@/shared/api/apiError";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type PendingDialog =
  | { type: "confirm" }
  | { type: "reject"; participant: RecruitParticipantSummary };

export function RecruitParticipantsScreen() {
  const navigate = useNavigate();
  const { postId: postIdParam } = useParams();
  const { home, isHost } = useTeamDetailContext();
  const postId = Number(postIdParam);
  const validPostId = Number.isInteger(postId) && postId > 0;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const participantsQuery = useQuery({
    ...teamQueries.recruitParticipants(
      home.meetingId,
      validPostId ? postId : 0,
    ),
    enabled: isHost && validPostId,
    refetchOnWindowFocus: true,
  });
  const managedRecruitsQuery = useQuery({
    ...teamQueries.managedRecruits(home.meetingId),
    enabled: isHost && validPostId,
  });
  const detailQuery = useQuery({
    ...teamQueries.recruitParticipant(
      home.meetingId,
      validPostId ? postId : 0,
      expandedId ?? 0,
    ),
    enabled: isHost && validPostId && expandedId !== null,
  });
  const rejectMutation = useRejectRecruitParticipantMutation(
    home.meetingId,
    postId,
  );
  const confirmMutation = useConfirmRecruitParticipantsMutation(
    home.meetingId,
    postId,
  );
  const attendanceMutation = useUpdateRecruitAttendanceMutation(
    home.meetingId,
    postId,
  );

  if (!isHost) return <Navigate to={`/teams/${home.meetingId}`} replace />;
  if (!validPostId)
    return (
      <Navigate to={`/teams/${home.meetingId}/settings/activities`} replace />
    );
  const data = participantsQuery.data;
  const activityTitle = managedRecruitsQuery.data?.find(
    (activity) => activity.postId === postId,
  )?.title;
  const uiState = data
    ? getRecruitParticipantUiState({
        confirmationStatus: data.confirmationStatus,
        activityEndAt: data.activityEndAt,
      })
    : null;
  const appliedCount =
    data?.participants.filter(
      (participant) => participant.participationStatus === "APPLIED",
    ).length ?? 0;

  const updateAttendance = (
    participant: RecruitParticipantSummary,
    attendanceStatus: "PRESENT" | "ABSENT",
  ) => {
    if (participant.attendanceStatus === attendanceStatus) return;
    setActionError(null);
    attendanceMutation.mutate(
      {
        participationId: participant.participationId,
        request: { attendanceStatus },
      },
      {
        onError: (error) =>
          setActionError(
            error instanceof ApiError &&
              error.status === 409 &&
              attendanceStatus === "ABSENT"
              ? "출석을 변경하려면 작성한 활동 후기를 먼저 삭제해 주세요."
              : "출석 상태를 변경하지 못했어요.",
          ),
      },
    );
  };

  return (
    <main className="flex min-h-dvh flex-col bg-white px-5.5 font-sans">
      <PageHeader
        title={activityTitle ?? "봉사 신청자 관리"}
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-text-gray-400 px-3 py-1.5 text-xs text-white">
            팀장
          </span>
        }
        sticky
        className="bg-white"
      />
      <section className="flex flex-1 flex-col pb-28 pt-6">
        {participantsQuery.isLoading ? (
          <div className="flex min-h-60 flex-1 flex-col justify-center">
            <LoadingState label="신청자를 불러오는 중" />
          </div>
        ) : participantsQuery.isError || !data ? (
          <div className="flex min-h-60 flex-1 flex-col justify-center">
            <ErrorState
              title="신청자를 불러오지 못했어요"
              primaryAction={{
                label: "다시 시도",
                onClick: () => void participantsQuery.refetch(),
              }}
            />
          </div>
        ) : (
          <>
            {uiState?.showConfirm ? (
              <Button
                fullWidth
                className="mb-5 mt-1 rounded-[12px] text-[16px] font-medium h-11"
                disabled={appliedCount === 0 || confirmMutation.isPending}
                onClick={() => setPendingDialog({ type: "confirm" })}
              >
                인원 확정하기
              </Button>
            ) : null}
            {uiState?.showAttendance && uiState.attendanceDisabled ? (
              <p className="mb-4 rounded-xl bg-stroke/30 p-3 text-center text-sm text-text-gray-300">
                활동 종료 후 출석 처리가 가능합니다.
              </p>
            ) : null}
            {actionError ? (
              <p role="alert" className="mb-4 text-sm text-point-red">
                {actionError}
              </p>
            ) : null}
            {data.participants.length === 0 ? (
              <EmptyState
                className="min-h-60"
                title="봉사 신청자가 없어요"
                description="신청자가 생기면 이곳에 표시돼요."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {data.participants.map((participant) => {
                  const expanded = expandedId === participant.participationId;
                  const updatingThis =
                    attendanceMutation.isPending &&
                    attendanceMutation.variables?.participationId ===
                      participant.participationId;
                  return (
                    <RecruitParticipantCard
                      key={participant.participationId}
                      participant={participant}
                      expanded={expanded}
                      showReject={Boolean(
                        uiState?.showReject &&
                        participant.participationStatus === "APPLIED",
                      )}
                      showAttendance={Boolean(
                        uiState?.showAttendance &&
                        participant.participationStatus !== "REJECTED" &&
                        participant.participationStatus !== "CANCELLED",
                      )}
                      attendanceDisabled={uiState?.attendanceDisabled ?? true}
                      attendancePending={updatingThis}
                      rejectPending={rejectMutation.isPending}
                      onToggle={() =>
                        setExpandedId(
                          expanded ? null : participant.participationId,
                        )
                      }
                      onReject={() =>
                        setPendingDialog({ type: "reject", participant })
                      }
                      onAttendanceChange={(attendanceStatus) =>
                        updateAttendance(participant, attendanceStatus)
                      }
                    >
                      {expanded ? (
                        detailQuery.isLoading ? (
                          <LoadingState
                            className="min-h-20"
                            label="상세 정보를 불러오는 중"
                          />
                        ) : detailQuery.isError ? (
                          <ErrorState
                            className="min-h-20"
                            title="상세 정보를 불러오지 못했어요"
                          />
                        ) : detailQuery.data ? (
                          <MeetingPersonDetail {...detailQuery.data} />
                        ) : null
                      ) : null}
                    </RecruitParticipantCard>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
      <ConfirmDialog
        open={pendingDialog !== null}
        title={
          pendingDialog?.type === "confirm"
            ? "현재 신청 인원으로 확정하시겠습니까?"
            : "해당 신청자를 반려하시겠습니까?"
        }
        confirmText={pendingDialog?.type === "confirm" ? "확정" : "반려"}
        confirmVariant={
          pendingDialog?.type === "confirm" ? "primary" : "danger"
        }
        isPending={confirmMutation.isPending || rejectMutation.isPending}
        onCancel={() => setPendingDialog(null)}
        onConfirm={() => {
          if (pendingDialog?.type === "confirm")
            confirmMutation.mutate(undefined, {
              onSuccess: () => setPendingDialog(null),
              onError: () => {
                setPendingDialog(null);
                setActionError(
                  "참가자를 확정하지 못했어요. 신청자와 확정 상태를 확인해 주세요.",
                );
              },
            });
          else if (pendingDialog?.type === "reject")
            rejectMutation.mutate(pendingDialog.participant.participationId, {
              onSuccess: () => setPendingDialog(null),
              onError: () => {
                setPendingDialog(null);
                setActionError("신청자를 반려하지 못했어요.");
              },
            });
        }}
      />
    </main>
  );
}
