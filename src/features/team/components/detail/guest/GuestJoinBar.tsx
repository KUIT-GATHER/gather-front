import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useJoinMeetingMutation } from "@/features/team/hooks/useJoinMeetingMutation";
import { useCancelMyMeetingJoinRequestMutation } from "@/features/team/hooks/useMeetingManagementMutations";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

type GuestJoinBarProps = {
  disabled: boolean;
  meetingId: number;
  meetingName: string;
  pendingJoinRequested: boolean;
};

export function GuestJoinBar({
  disabled,
  meetingId,
  meetingName,
  pendingJoinRequested,
}: GuestJoinBarProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);
  const [joinCompleteOpen, setJoinCompleteOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const cancelMutation = useCancelMyMeetingJoinRequestMutation(meetingId);
  const joinMeetingMutation = useJoinMeetingMutation(meetingId, {
    onSuccess: () => {
      setJoinConfirmOpen(false);
      setJoinCompleteOpen(true);
    },
  });
  const closeJoinCompleteDialog = () => {
    setJoinCompleteOpen(false);
  };
  const openJoinConfirm = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: `/teams/${meetingId}` },
      });
      return;
    }

    if (pendingJoinRequested) {
      setActionError(null);
      setCancelConfirmOpen(true);
      return;
    }

    setActionError(null);
    setJoinConfirmOpen(true);
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-30 w-full max-w-app -translate-x-1/2 px-11">
        <Button
          size="pill"
          fullWidth
          disabled={
            (disabled && !pendingJoinRequested) ||
            joinMeetingMutation.isPending ||
            cancelMutation.isPending
          }
          onClick={openJoinConfirm}
          className="pointer-events-auto disabled:text-text-gray-400"
        >
          {joinMeetingMutation.isPending
            ? "신청 중"
            : pendingJoinRequested
              ? "신청 취소하기"
              : disabled
                ? "모집 마감된 모임이에요"
                : "모임 신청하기"}
        </Button>
        {actionError ? (
          <p
            role="alert"
            className="pointer-events-auto mt-2 rounded-lg bg-white px-3 py-2 text-center text-xs text-point-red shadow-sm"
          >
            {actionError}
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={joinConfirmOpen}
        title={`'${meetingName}' 모임에 참여하시겠습니까?`}
        cancelText="취소"
        confirmText="신청"
        onCancel={() => setJoinConfirmOpen(false)}
        onConfirm={() =>
          joinMeetingMutation.mutate(undefined, {
            onError: () => {
              setJoinConfirmOpen(false);
              setActionError(
                "가입 신청을 완료하지 못했어요. 다시 시도해 주세요.",
              );
            },
          })
        }
        isPending={joinMeetingMutation.isPending}
      />

      <ConfirmDialog
        open={joinCompleteOpen}
        title="참여 신청이 완료되었어요!"
        confirmText="확인"
        onCancel={closeJoinCompleteDialog}
        onConfirm={closeJoinCompleteDialog}
        showCancel={false}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="가입 신청을 취소하시겠어요?"
        description="취소 후 모집 기간 안에는 다시 신청할 수 있어요."
        confirmText="신청 취소"
        isPending={cancelMutation.isPending}
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() =>
          cancelMutation.mutate(undefined, {
            onSuccess: () => setCancelConfirmOpen(false),
            onError: () => {
              setCancelConfirmOpen(false);
              setActionError(
                "가입 신청을 취소하지 못했어요. 다시 시도해 주세요.",
              );
            },
          })
        }
      />
    </>
  );
}
