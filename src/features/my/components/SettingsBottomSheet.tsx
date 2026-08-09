import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";
import { useWithdrawAccountMutation } from "@/features/auth/hooks/useWithdrawAccountMutation";
import type { NotificationSettingsView } from "@/features/notification/components/NotificationSettingsSheet";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import BottomSheet from "@/shared/ui/BottomSheet";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

import packageJson from "../../../../package.json";

const MEETING_HOST_WITHDRAWAL_ERROR_MESSAGE =
  "운영 중인 모임이 있어 탈퇴할 수 없어요.\n모임을 정리한 후 다시 시도해 주세요.";
const UNKNOWN_WITHDRAWAL_ERROR_MESSAGE =
  "회원탈퇴 결과를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";

function getWithdrawalErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return UNKNOWN_WITHDRAWAL_ERROR_MESSAGE;
  }

  if (error.code === API_ERROR_CODE.ACCOUNT_WITHDRAWAL_BLOCKED_MEETING_HOST) {
    return error.message || MEETING_HOST_WITHDRAWAL_ERROR_MESSAGE;
  }

  return error.message;
}

type SettingsBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenNotificationSettings: (
    view: Exclude<NotificationSettingsView, "menu">,
  ) => void;
};

function SettingLink({
  children,
  onClick,
}: {
  children: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-between text-body-15"
    >
      {children}
      <ChevronRight className="size-5 text-text-gray-400" />
    </button>
  );
}

export function SettingsBottomSheet({
  open,
  onOpenChange,
  onOpenNotificationSettings,
}: SettingsBottomSheetProps) {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const withdrawMutation = useWithdrawAccountMutation();
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string>();

  const openLegalDocument = (type: "service" | "privacy") => {
    onOpenChange(false);
    navigate("/my?settings=open", { replace: true });
    navigate(`/terms/${type}`);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  const handleWithdraw = () => {
    setWithdrawError(undefined);
    withdrawMutation.mutate(undefined, {
      onSuccess: () => {
        setWithdrawConfirmOpen(false);
        navigate("/login", { replace: true });
      },
      onError: (error) => {
        setWithdrawError(getWithdrawalErrorMessage(error));
      },
    });
  };

  const closeWithdrawConfirm = () => {
    setWithdrawError(undefined);
    setWithdrawConfirmOpen(false);
  };

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="설정"
        className="h-[535px] rounded-t-[40px]"
        contentClassName="px-5.5 pt-1 pb-8"
      >
        <section>
          <h2 className="text-title-18">안내</h2>
          <div className="mt-3">
            <SettingLink onClick={() => openLegalDocument("service")}>
              서비스 이용약관
            </SettingLink>
            <SettingLink onClick={() => openLegalDocument("privacy")}>
              개인정보 처리방침
            </SettingLink>
            <div className="flex h-10 items-center justify-between text-body-15">
              <span>버전 정보</span>
              <span className="text-text-gray-400">{packageJson.version}</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-title-18">알림</h2>
          <div className="mt-3">
            <SettingLink onClick={() => onOpenNotificationSettings("activity")}>
              봉사활동 알림 설정
            </SettingLink>
            <SettingLink onClick={() => onOpenNotificationSettings("meeting")}>
              모임활동 알림 설정
            </SettingLink>
          </div>
        </section>

        <div className="mt-8 flex flex-col items-start gap-2 text-body-14 text-text-gray-300">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
          </button>
          <button
            type="button"
            onClick={() => {
              setWithdrawError(undefined);
              setWithdrawConfirmOpen(true);
            }}
            className="py-1"
          >
            회원탈퇴
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={withdrawConfirmOpen}
        title="정말 탈퇴하시겠습니까?"
        description={
          <>
            <span>
              탈퇴 시 작성한 게시글과 댓글은 삭제되지 않으며,
              <br /> 계정 정보와 활동 내역은 복구할 수 없습니다.
            </span>
            <span className="mt-2 block">
              회원탈퇴는 되돌릴 수 없으며,
              <br /> 탈퇴 후 7일간 재가입할 수 없습니다.
            </span>
            {withdrawError ? (
              <span
                role="alert"
                className="mt-3 block text-body-14 whitespace-pre-line text-point-red"
              >
                {withdrawError}
              </span>
            ) : null}
          </>
        }
        cancelText="취소"
        confirmText="확인"
        confirmVariant="danger"
        isPending={withdrawMutation.isPending}
        onCancel={closeWithdrawConfirm}
        onConfirm={handleWithdraw}
      />
    </>
  );
}
