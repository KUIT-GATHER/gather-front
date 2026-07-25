import { useState } from "react";

import { useJoinMeetingMutation } from "@/features/team/hooks/useJoinMeetingMutation";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

type GuestJoinBarProps = {
  disabled: boolean;
  meetingId: number;
  meetingName: string;
};

export function GuestJoinBar({
  disabled,
  meetingId,
  meetingName,
}: GuestJoinBarProps) {
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);
  const [joinCompleteOpen, setJoinCompleteOpen] = useState(false);
  const [isJoinRequested, setIsJoinRequested] = useState(false);
  const joinMeetingMutation = useJoinMeetingMutation(meetingId, {
    invalidateOnSuccess: false,
    onSuccess: () => {
      setJoinConfirmOpen(false);
      setIsJoinRequested(true);
      setJoinCompleteOpen(true);
    },
  });
  const closeJoinCompleteDialog = () => {
    setJoinCompleteOpen(false);
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-30 w-full max-w-app -translate-x-1/2 px-11">
        <Button
          size="pill"
          fullWidth
          disabled={
            disabled || isJoinRequested || joinMeetingMutation.isPending
          }
          onClick={() => setJoinConfirmOpen(true)}
          className="pointer-events-auto disabled:text-text-gray-400"
        >
          {joinMeetingMutation.isPending
            ? "신청 중"
            : isJoinRequested
              ? "신청 취소하기"
              : disabled
                ? "모집 마감된 모임이에요"
                : "모임 신청하기"}
        </Button>
      </div>

      <ConfirmDialog
        open={joinConfirmOpen}
        title={`'${meetingName}' 모임에 참여하시겠습니까?`}
        cancelText="취소"
        confirmText="신청"
        onCancel={() => setJoinConfirmOpen(false)}
        onConfirm={() => joinMeetingMutation.mutate()}
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
    </>
  );
}
