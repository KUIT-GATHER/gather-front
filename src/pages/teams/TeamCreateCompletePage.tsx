import { Navigate, useNavigate, useSearchParams } from "react-router";

import closeIcon from "@/assets/icons/X.svg";
import createCompleteIcon from "@/shared/assets/puzzle/create-complete.svg";
import Button from "@/shared/ui/Button";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";

export function TeamCreateCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meetingId = Number(searchParams.get("meetingId"));
  const volunteerPostingId = Number(searchParams.get("volunteerPostingId"));
  const isValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;
  const isPostingBased =
    Number.isInteger(volunteerPostingId) && volunteerPostingId > 0;

  if (!isValidMeetingId) {
    return <Navigate to="/teams" replace />;
  }

  const handleClose = () => {
    navigate(isPostingBased ? `/volunteers/${volunteerPostingId}` : "/teams", {
      replace: true,
    });
  };

  return (
    <PageContainer
      size="narrow"
      className="relative flex min-h-dvh flex-col bg-bg pb-[calc(2.25rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex justify-end pt-15">
        <IconButton
          label="완료 화면 닫기"
          icon={<img src={closeIcon} alt="" />}
          size="medium"
          variant="plain"
          onClick={handleClose}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center pb-24">
        <img
          src={createCompleteIcon}
          alt=""
          aria-hidden="true"
          className="h-24 w-25"
        />

        <h1 className="mt-4 text-2xl font-semibold leading-7 text-text">
          모임 생성 완료!
        </h1>
        <p className="mt-6 text-center text-body-14 leading-6 text-text">
          이제 같은 관심사를 가진 사람들을 모집할 차례예요.
          <br />
          함께 성장하고 나눔을 실천할 팀원을 만나보세요.
        </p>
      </div>

      <Button
        fullWidth
        className="h-13 active:bg-icon"
        onClick={() => navigate(`/teams/${meetingId}/posts`, { replace: true })}
      >
        내 모임 보러 가기
      </Button>
    </PageContainer>
  );
}
