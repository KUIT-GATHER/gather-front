import { Navigate, useNavigate } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { TeamSettingsMenuItem } from "@/features/team/components/settings/TeamSettingsMenuItem";

import InformationIcon from "@/assets/team/information-square.svg";
import MemberIcon from "@/assets/team/member.svg";
import ActivityIcon from "@/assets/team/activity.svg";
import ApplicationIcon from "@/assets/team/application.svg";

export function TeamSettingsPage() {
  const { home, isHost } = useTeamDetailContext();
  const navigate = useNavigate();

  // 팀원이 주소로 직접 접근하는 경우 모임 홈으로 이동
  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  return (
    <main className="px-5.5 py-4">
      <div className="flex flex-col gap-2">
        <TeamSettingsMenuItem
          iconSrc={InformationIcon}
          title="팀 정보 수정"
          description="팀 유형 · 모집 상태 표시"
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/info`);
          }}
        />

        <TeamSettingsMenuItem
          iconSrc={MemberIcon}
          title="멤버 관리"
          description="총 멤버 모임 수 표시"
          onClick={() => {}}
        />

        <TeamSettingsMenuItem
          iconSrc={ApplicationIcon}
          title="가입 신청 관리"
          description="가입 대기 인원 수 표시"
          onClick={() => {}}
        />

        <TeamSettingsMenuItem
          iconSrc={ActivityIcon}
          title="활동 관리"
          description="모임 내 봉사활동 관리"
          onClick={() => {}}
        />
      </div>
      <button
        type="button"
        className="mt-10 h-12 w-full rounded-[12px] bg-[#F76073] text-body-15-medium text-[#FAFAF8]"
      >
        모임 해산하기
      </button>
    </main>
  );
}
